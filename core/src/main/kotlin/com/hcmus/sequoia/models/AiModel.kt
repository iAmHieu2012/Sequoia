package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing an AI Model configuration.
 * 
 * @property id The unique document ID.
 * @property name Model name.
 * @property description Brief description.
 * @property taskType e.g., object_detection, classification.
 * @property fileUrl R2 download URL.
 * @property format e.g., litert.
 */
@Serializable
data class AiModel(
    var id: String = "",
    val name: String = "",
    val description: String = "",
    val taskType: String = "",
    val fileUrl: String = "",
    val format: String = "litert"
)
