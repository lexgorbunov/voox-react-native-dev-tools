package com.reactnativedevtools

import android.content.res.Resources
import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider

class RoundTopCornersProvider : ViewOutlineProvider() {
    companion object {
        val radius = Resources.getSystem().displayMetrics.density * 8
    }

    override fun getOutline(view: View, outline: Outline) {
        outline.setRoundRect(0, 0, view.width, 2 * view.height, radius)
    }
}
