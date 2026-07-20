package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing an AI Model configuration for the Playground.
 * 
 * @property id The unique document ID from Firestore.
 * @property name Model name.
 * @property description Brief description of what the model does.
 * @property taskType The task type (e.g., object_detection, classification).
 * @property fileUrl Cloudflare R2 download URL for the model file.
 * @property fileSizeBytes The size of the model file in bytes.
 * @property version Version string of the model.
 * @property format The format of the model (e.g., litert).
 * @property defaultConfig Map of default configuration parameters (e.g., threshold).
 * @property createdAt Timestamp when the model was created.
 * @property updatedAt Timestamp when the model was last updated.
 */
@Serializable
data class AiModel(
    var id: String = "",
    val name: String = "",
    val description: String = "",
    val taskType: String = "",
    val fileUrl: String = "",
    val fileSizeBytes: Long = 0L,
    val version: String = "1.0",
    val format: String = "litert",
    val defaultConfig: Map<String, String> = emptyMap(),
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)
