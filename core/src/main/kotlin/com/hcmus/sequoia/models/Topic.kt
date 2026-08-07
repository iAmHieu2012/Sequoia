package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Topic (e.g., Computer Vision, NLP).
 * 
 * @property id The Firestore document ID.
 * @property name Name of the topic.
 * @property sortOrder Used to control display order.
 * @property articleCount Number of articles in this topic.
 * @property createdAt Timestamp when the topic was created.
 */
@Serializable
data class Topic(
    var id: String = "",
    val name: String = "",
    val description: String = "",
    val sortOrder: Int = 0,
    val articleCount: Int = 0,
    val createdAt: Long = 0L
)
