package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Entity representing the visual arrangement of a topic's articles or standalone anomalies in the Cosmos UI.
 * 
 * This is denormalized and stored separately from the core educational entities to minimize Firestore read costs 
 * when initializing the massive Galaxy Map interface.
 *
 * @property id The Firestore document ID (matches topic ID or collection ID).
 * @property mapType The type of map (e.g., "topic", "rogue-anomalies").
 * @property theme The visual theme of the map (default: "cosmos").
 * @property nodes A list of celestial nodes representing articles.
 */
@Serializable
data class CosmosMap(
    var id: String = "",
    var mapType: String = "topic",
    var theme: String = "cosmos",
    var nodes: List<CosmosNode> = emptyList()
)

/**
 * Represents a single celestial object (article) within the Cosmos Map.
 * 
 * Embedded directly within CosmosMap to allow rendering the entire graph structure in a single document read.
 *
 * @property articleId The unique ID of the corresponding article.
 * @property title The display title of the celestial node.
 * @property celestialType The visual representation type (e.g., star, binary_star, anomaly, nebula).
 * @property x The absolute X coordinate on the infinite 2D canvas.
 * @property y The absolute Y coordinate on the infinite 2D canvas.
 * @property connections A list of articleIds that this node connects to (forming light beams).
 */
@Serializable
data class CosmosNode(
    var articleId: String = "",
    var title: String = "",
    var celestialType: String = "",
    var x: Double = 0.0,
    var y: Double = 0.0,
    var connections: List<String> = emptyList()
)
