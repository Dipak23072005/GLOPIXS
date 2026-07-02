package com.anonymous.glopixs

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.widget.FrameLayout
import android.widget.ImageView
import java.util.Locale

class IntroActivity : Activity() {
  private val totalFrames = 50
  private val mainHandler = Handler(Looper.getMainLooper())
  private var openedMain = false
  private var frameIndex = 1

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val imageView = ImageView(this).apply {
      scaleType = ImageView.ScaleType.FIT_CENTER
      setBackgroundColor(android.graphics.Color.BLACK)
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    setContentView(FrameLayout(this).apply {
      setBackgroundColor(android.graphics.Color.BLACK)
      addView(imageView)
    })
    hideSystemUi()

    animateFrames(imageView)
    mainHandler.postDelayed({ openMain() }, 5200L)
  }

  override fun onResume() {
    super.onResume()
    hideSystemUi()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) hideSystemUi()
  }

  private fun animateFrames(imageView: ImageView) {
    val runnable = object : Runnable {
      override fun run() {
        if (openedMain) return

        val name = String.format(Locale.US, "intro_frame_%03d", frameIndex)
        val resourceId = resources.getIdentifier(name, "drawable", packageName)
        if (resourceId != 0) imageView.setImageResource(resourceId)

        frameIndex += 1
        if (frameIndex <= totalFrames) {
          mainHandler.postDelayed(this, 100L)
        } else {
          openMain()
        }
      }
    }
    mainHandler.post(runnable)
  }

  private fun openMain() {
    if (openedMain) return
    openedMain = true
    mainHandler.removeCallbacksAndMessages(null)
    startActivity(
      Intent(this, MainActivity::class.java)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        .putExtra("skipIntro", true)
    )
    finish()
  }

  private fun hideSystemUi() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.decorView.post {
        window.decorView.windowInsetsController?.let { controller ->
          controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
          controller.systemBarsBehavior =
            WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
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
}

