package com.reactnativedevtools

import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider

class RoundTopCornersProvider(private val radius: Float) : ViewOutlineProvider() {

  override fun getOutline(view: View, outline: Outline) {
    val density = view.context.resources.displayMetrics.density
    outline.setRoundRect(0, 0, view.width, 2 * view.height, density * radius)
  }
}


class RoundAllCornersProvider(private val radius: Float) : ViewOutlineProvider() {

  override fun getOutline(view: View, outline: Outline) {
    val density = view.context.resources.displayMetrics.density
    outline.setRoundRect(0, 0, view.width, view.height, density * radius)
  }
}
