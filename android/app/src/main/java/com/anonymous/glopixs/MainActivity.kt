package com.anonymous.glopixs

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.graphics.Matrix
import android.graphics.SurfaceTexture
import android.media.MediaMetadataRetriever
import android.media.MediaPlayer
import android.view.Surface
import android.view.TextureView
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.widget.FrameLayout
import android.widget.ImageView

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private val redrawHandler = Handler(Looper.getMainLooper())

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
  }

  override fun onResume() {
    super.onResume()
    forceReactRootRedraw()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) forceReactRootRedraw()
  }

  private fun forceReactRootRedraw() {
    repeat(6) { index ->
      redrawHandler.postDelayed({
        val root = findViewById<ViewGroup>(android.R.id.content)
        root?.requestLayout()
        root?.invalidate()
        window.decorView.requestLayout()
        window.decorView.invalidate()
      }, 120L * (index + 1))
    }
  }


  private fun hideSystemBarsForIntro() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.insetsController?.let { controller ->
        controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
        controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      }
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_FULLSCREEN
          or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
          or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
          or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
          or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
          or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        )
    }
  }

  private fun restoreSystemBarsAfterIntro() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.insetsController?.show(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }
  }

  private fun showNativeIntroVideo() {
    hideSystemBarsForIntro()

    val mainHandler = Handler(Looper.getMainLooper())
    var introDurationMs = 5000L
    var introRemoved = false
    val introContainer = FrameLayout(this).apply {
      setBackgroundColor(android.graphics.Color.rgb(30, 29, 27))
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val posterFrame = ImageView(this).apply {
      scaleType = ImageView.ScaleType.CENTER_CROP
      setBackgroundColor(android.graphics.Color.rgb(30, 29, 27))
      try {
        val retriever = MediaMetadataRetriever()
        val fd = resources.openRawResourceFd(R.raw.glopixs_intro)
        retriever.setDataSource(fd.fileDescriptor, fd.startOffset, fd.length)
        introDurationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: introDurationMs
        val frame = retriever.getFrameAtTime(500_000, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
        if (frame != null) setImageBitmap(frame)
        retriever.release()
        fd.close()
      } catch (_: Exception) {
      }
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    var mediaPlayer: MediaPlayer? = null

    fun removeIntro() {
      if (!introRemoved) {
        introRemoved = true
        mainHandler.removeCallbacksAndMessages(null)
        try {
          mediaPlayer?.setOnCompletionListener(null)
          mediaPlayer?.setOnPreparedListener(null)
          mediaPlayer?.setOnInfoListener(null)
          mediaPlayer?.setOnErrorListener(null)
          mediaPlayer?.release()
        } catch (_: Exception) {
        } finally {
          mediaPlayer = null
        }
        introContainer.animate()
          .alpha(0f)
          .setDuration(90L)
          .withEndAction {
            (introContainer.parent as? ViewGroup)?.removeView(introContainer)
            restoreSystemBarsAfterIntro()
          }
          .start()
      }
    }

    fun applyCenterCrop(textureView: TextureView, player: MediaPlayer) {
      val viewWidth = textureView.width.toFloat()
      val viewHeight = textureView.height.toFloat()
      val videoWidth = player.videoWidth.toFloat()
      val videoHeight = player.videoHeight.toFloat()
      if (viewWidth <= 0f || viewHeight <= 0f || videoWidth <= 0f || videoHeight <= 0f) return

      val viewAspect = viewWidth / viewHeight
      val videoAspect = videoWidth / videoHeight
      var scaleX = 1f
      var scaleY = 1f
      if (videoAspect > viewAspect) {
        scaleX = videoAspect / viewAspect
      } else {
        scaleY = viewAspect / videoAspect
      }
      val matrix = Matrix().apply {
        setScale(scaleX, scaleY, viewWidth / 2f, viewHeight / 2f)
      }
      textureView.setTransform(matrix)
    }

    val introVideo = TextureView(this).apply {
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT,
        Gravity.CENTER
      )
      surfaceTextureListener = object : TextureView.SurfaceTextureListener {
        override fun onSurfaceTextureAvailable(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
          val surface = Surface(surfaceTexture)
          val player = MediaPlayer()
          mediaPlayer = player

          try {
            val fd = resources.openRawResourceFd(R.raw.glopixs_intro)
            player.setDataSource(fd.fileDescriptor, fd.startOffset, fd.length)
            fd.close()
            player.setSurface(surface)
            player.isLooping = false
            player.setVolume(0f, 0f)
            player.setOnPreparedListener { preparedPlayer ->
              applyCenterCrop(this@apply, preparedPlayer)
              requestFocus()
              preparedPlayer.start()
              mainHandler.postDelayed(
                { removeIntro() },
                preparedPlayer.duration.coerceAtLeast(introDurationMs.toInt()).toLong() + 220L
              )
            }
            player.setOnInfoListener { _, what, _ ->
              if (what == MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) {
                (posterFrame.parent as? ViewGroup)?.removeView(posterFrame)
              }
              false
            }
            player.setOnCompletionListener {
              mainHandler.postDelayed({ removeIntro() }, 180L)
            }
            player.setOnErrorListener { _, _, _ ->
              mainHandler.postDelayed({ removeIntro() }, 500L)
              true
            }
            player.prepareAsync()
          } catch (_: Exception) {
            surface.release()
            mainHandler.postDelayed({ removeIntro() }, 500L)
          }
        }

        override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {
          mediaPlayer?.let { applyCenterCrop(this@apply, it) }
        }

        override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
          mediaPlayer?.release()
          mediaPlayer = null
          return true
        }

        override fun onSurfaceTextureUpdated(surface: SurfaceTexture) = Unit
      }
    }

    introContainer.addView(introVideo)
    introContainer.addView(posterFrame)
    addContentView(introContainer, introContainer.layoutParams)

    mainHandler.postDelayed({ removeIntro() }, 6500L)
    introContainer.postDelayed({ removeIntro() }, 6500L)
    window.decorView.postDelayed({ removeIntro() }, 7200L)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}


