package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Textbook in the Sequoia platform.
 * 
 * @property id The unique document ID from Firestore.
 * @property title The title of the textbook.
 * @property description A brief summary of what the textbook covers.
 * @property authors A list of authors who contributed to the textbook.
 * @property coverImageUrl URL to the textbook cover image.
 * @property totalChapters Number of chapters in this textbook.
 * @property sortOrder Used to control the display order on the UI.
 * @property createdAt Timestamp when the textbook was created.
 * @property updatedAt Timestamp when the textbook was last updated.
 */
@Serializable
data class Textbook(
    var id: String = "",
    val title: String = "",
    val description: String = "",
    val authors: List<String> = emptyList(),
    val coverImageUrl: String = "",
    val totalChapters: Int = 0,
    val sortOrder: Int = 0,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)
