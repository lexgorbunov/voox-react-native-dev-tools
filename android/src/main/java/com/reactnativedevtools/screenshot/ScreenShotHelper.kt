package com.reactnativedevtools.screenshot


import android.graphics.Bitmap
import android.util.Base64
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import java.io.ByteArrayOutputStream
import android.graphics.BitmapFactory





object ScreenShotHelper {
    fun takeScreenShot(context: ReactApplicationContext): String? =
        try {
            val v1: View = context.currentActivity!!.window.decorView.rootView
            v1.isDrawingCacheEnabled = true
            val bitmap: Bitmap = Bitmap.createBitmap(v1.drawingCache)
            v1.isDrawingCacheEnabled = false
            val base64 = encodeImage(bitmap)
            bitmap.recycle()
            base64
        } catch (e: Throwable) {
            // Several error may come out with file handling or DOM
            e.printStackTrace()
            null
        }

    fun decodeImage(encodedImage: String): Bitmap {
        val decodedString: ByteArray = Base64.decode(encodedImage, Base64.NO_WRAP)
        return BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
    }

    private fun encodeImage(bm: Bitmap): String? {
        val baos = ByteArrayOutputStream()
        bm.compress(Bitmap.CompressFormat.JPEG, 90, baos)
        val b = baos.toByteArray()
        return Base64.encodeToString(b, Base64.NO_WRAP)
    }
}
