package com.hcmus.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Textbook in the Sequoia platform.
 * 
 * @property id The unique document ID from Firestore.
 * @property title The title of the textbook.
 * @property description A brief summary of what the textbook covers.
 * @property authors A list of authors who contributed to the textbook.
 * @property sortOrder Used to control the display order on the UI.
 */
@Serializable
data class Textbook(
    var id: String = "",
    val title: String = "",
    val description: String = "",
    val authors: List<String> = emptyList(),
    val sortOrder: Int = 0
)
