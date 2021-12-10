package com.reactnativedevtools.dialog

import android.app.Activity
import android.app.Dialog
import android.os.Bundle
import android.util.DisplayMetrics
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.reactnativedevtools.R
import com.reactnativedevtools.screenshot.ScreenShotHelper


private const val ARG_SCREENSHOT_SRC = "arg-screenshot-src"

class ToolsDialogFragment : BottomSheetDialogFragment() {

    companion object {
        fun newInstance(screenshot: String?): ToolsDialogFragment = ToolsDialogFragment().apply {
            arguments = Bundle().apply {
                screenshot?.let { putString(ARG_SCREENSHOT_SRC, it) }
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_tools_dialog, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        arguments?.getString(ARG_SCREENSHOT_SRC)?.let { screenshot ->
            val bitmap = ScreenShotHelper.decodeImage(screenshot)
            view.findViewById<ImageView>(R.id.screenshotImg).setImageBitmap(bitmap)
        }
        view.findViewById<Button>(R.id.sendBtn).setOnClickListener {
            println("🔦 Send callback")
        }
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return super.onCreateDialog(savedInstanceState).also {
            it.setOnShowListener { dialog ->
                dialog as BottomSheetDialog
                val bottomSheet = dialog
                    .findViewById<FrameLayout>(com.google.android.material.R.id.design_bottom_sheet)!!
                val behavior: BottomSheetBehavior<*> = BottomSheetBehavior.from<View>(bottomSheet)
                val layoutParams: ViewGroup.LayoutParams = bottomSheet.layoutParams
                layoutParams.height = getBottomSheetDialogDefaultHeight()
                bottomSheet.layoutParams = layoutParams
                behavior.state = BottomSheetBehavior.STATE_EXPANDED
                behavior.skipCollapsed = true
            }
        }
    }

    private fun getBottomSheetDialogDefaultHeight(): Int = getWindowHeight() * 85 / 100

    private fun getWindowHeight(): Int {
        // Calculate window height for fullscreen use
        val displayMetrics = DisplayMetrics()
        (context as Activity?)!!.windowManager.defaultDisplay.getMetrics(displayMetrics)
        return displayMetrics.heightPixels
    }
}
