package com.hcmus.sequoia.services

import com.hcmus.sequoia.models.*
import com.hcmus.sequoia.plugins.FirebaseConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CosmosService {
    suspend fun getCosmosMap(mapId: String): CosmosMap? = withContext(Dispatchers.IO) {
        val doc = FirebaseConfig.firestore.collection("cosmos_maps").document(mapId).get().get()
        if (doc.exists()) {
            val m = doc.toObject(CosmosMap::class.java)
            m?.id = doc.id
            m
        } else null
    }

    suspend fun getCosmosProgress(userId: String, mapId: String): CosmosProgress = withContext(Dispatchers.IO) {
        val progressDocId = "${userId}_${mapId}"
        val doc = FirebaseConfig.firestore.collection("cosmos_progress").document(progressDocId).get().get()
        
        if (doc.exists()) {
            val p = doc.toObject(CosmosProgress::class.java)
            p?.id = doc.id
            p ?: CosmosProgress(id = progressDocId, userId = userId, mapId = mapId, progressMap = emptyMap())
        } else {
            CosmosProgress(id = progressDocId, userId = userId, mapId = mapId, progressMap = emptyMap())
        }
    }
}
