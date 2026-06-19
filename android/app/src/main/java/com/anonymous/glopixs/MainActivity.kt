package com.anonymous.glopixs
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.net.Uri
import android.media.MediaMetadataRetriever
import android.media.MediaPlayer
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.VideoView

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    Handler(Looper.getMainLooper()).postDelayed({
      SplashScreenManager.hide()
    }, 600)
    super.onCreate(null)
    showNativeIntroVideo()
  }

  private fun showNativeIntroVideo() {
    val mainHandler = Handler(Looper.getMainLooper())
    var introDurationMs = 5000L
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

    fun removeIntro() {
      if (introContainer.parent != null) {
        (introContainer.parent as? ViewGroup)?.removeView(introContainer)
      }
    }

    val introVideo = VideoView(this).apply {
      setVideoURI(Uri.parse("android.resource://$packageName/${R.raw.glopixs_intro}"))
      setOnPreparedListener { player ->
        player.isLooping = false
        player.setVolume(0f, 0f)
        post {
          val videoWidth = player.videoWidth
          val videoHeight = player.videoHeight
          val containerWidth = introContainer.width
          val containerHeight = introContainer.height

          if (videoWidth > 0 && videoHeight > 0 && containerWidth > 0 && containerHeight > 0) {
            val scale = maxOf(
              containerWidth.toFloat() / videoWidth.toFloat(),
              containerHeight.toFloat() / videoHeight.toFloat()
            )
            layoutParams = FrameLayout.LayoutParams(
              (videoWidth * scale).toInt(),
              (videoHeight * scale).toInt(),
              Gravity.CENTER
            )
          }
        }
        start()
      }
      setOnInfoListener { _, what, _ ->
        if (what == MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) {
          (posterFrame.parent as? ViewGroup)?.removeView(posterFrame)
        }
        false
      }
      setOnCompletionListener {
        mainHandler.postDelayed({ removeIntro() }, 250L)
      }
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT,
        Gravity.CENTER
      )
    }

    introContainer.addView(introVideo)
    introContainer.addView(posterFrame)
    addContentView(introContainer, introContainer.layoutParams)

    mainHandler.postDelayed({ removeIntro() }, introDurationMs + 700L)
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
