package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Chapter inside a Textbook.
 * 
 * @property id The unique document ID from Firestore.
 * @property textbookId Reference to the parent textbook.
 * @property title The title of the chapter.
 * @property description A brief summary.
 * @property sortOrder Used to control the display order.
 * @property articleCount Number of articles in this chapter.
 */
@Serializable
data class Chapter(
    var id: String = "",
    val textbookId: String = "",
    val title: String = "",
    val description: String = "",
    val sortOrder: Int = 0,
    val articleCount: Int = 0
)
