package com.parksmart.utils

import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Callback
import okhttp3.Response
import java.io.IOException

class ApiClient {
    private val client = OkHttpClient()

    fun getParkingPrediction(location: String, callback: (String?) -> Unit) {
        val url = "https://api.example.com/predict?location=$location"
        val request = Request.Builder().url(url).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                callback(null)
            }

            override fun onResponse(call: okhttp3.Call, response: Response) {
                callback(response.body?.string())
            }
        })
    }
}
