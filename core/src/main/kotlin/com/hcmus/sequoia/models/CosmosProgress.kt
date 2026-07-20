package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Tracks a user's exploration progress across an entire textbook or topic in the Cosmos game domain.
 * 
 * Stored as a single document per user/map combination to ensure that checking the "Fog of War" 
 * state across hundreds of nodes requires only 1 Firestore read operation.
 *
 * @property id The unique document ID, typically formatted as "{userId}_{mapId}".
 * @property userId The ID of the user exploring the map.
 * @property mapId The ID of the map being explored (textbookId or topicId).
 * @property progressMap A map storing the exploration state of each article (e.g., "decoded", "locked").
 */
@Serializable
data class CosmosProgress(
    var id: String = "",
    val userId: String = "",
    val mapId: String = "",
    val progressMap: Map<String, String> = emptyMap()
)
