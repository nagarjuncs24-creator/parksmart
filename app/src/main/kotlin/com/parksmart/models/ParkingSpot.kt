package com.parksmart.models

data class ParkingSpot(
    val id: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val status: String = "free",
    val type: String = "street",
    val pricePerHour: Double = 0.0,
    val reportedBy: String = "",
    val verified: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)
