package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Topic (e.g., Computer Vision, NLP).
 * 
 * @property id The unique document ID.
 * @property name Name of the topic.
 * @property description Brief description.
 * @property iconUrl URL to the icon image.
 * @property sortOrder Used to control display order.
 * @property articleCount Number of articles in this topic.
 */
@Serializable
data class Topic(
    var id: String = "",
    val name: String = "",
    val description: String = "",
    val iconUrl: String = "",
    val sortOrder: Int = 0,
    val articleCount: Int = 0
)
