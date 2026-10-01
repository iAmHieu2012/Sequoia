import { supabase } from './seed_client';

async function seedContent() {
  const now = new Date().toISOString();
  
  console.log('Seeding Topics...');
  const cvTopicId = "computer-vision";
  const cvTopic = { id: cvTopicId, name: "Computer Vision", description: "Exploring visual data understanding algorithms and architectures.", article_count: 1, sort_order: 1 };
  const { error: cvErr } = await supabase.from('topics').upsert([cvTopic]);
  if (cvErr) throw cvErr;

  console.log('Seeding Articles...');
  const cvArticles = [
      { id: "image-classification", title: "Image Classification Basics", topic_id: cvTopicId, is_published: true, summary: "An introduction to classifying images.", tags: ["cv", "classification"], published_at: now }
  ];
  const { error: cvArtErr } = await supabase.from('articles').upsert(cvArticles);
  if (cvArtErr) throw cvArtErr;
  
  const { error: cvContErr } = await supabase.from('article_contents').upsert([{ id: "image-classification", content: "## Image Classification\n\nImage classification is the task of assigning a label to an entire image."}]);
  if (cvContErr) throw cvContErr;

  const rogueId = "standalone-articles";
  const rogueArticlesData = [
      { id: "attention-paper", title: "Attention Is All You Need", is_published: true, summary: "A breakdown of the Transformer architecture and self-attention mechanisms.", tags: ["paper", "nlp", "transformers"], published_at: now },
      { id: "resnet-paper", title: "Deep Residual Learning", is_published: true, summary: "Understanding skip connections and how ResNet enables training of extremely deep networks.", tags: ["paper", "cv", "resnet"], published_at: now }
  ];
  const { error: rogErr } = await supabase.from('articles').upsert(rogueArticlesData);
  if (rogErr) throw rogErr;
  
  const { error: rogContErr } = await supabase.from('article_contents').upsert([
    { id: "attention-paper", content: "## Attention Is All You Need\n\nThis 2017 paper introduced the Transformer architecture." },
    { id: "resnet-paper", content: "## Deep Residual Learning\n\nResNet solves the vanishing gradient problem in ultra-deep networks." }
  ]);
  if (rogContErr) throw rogContErr;

  console.log('Seeding Cosmos Maps & Nodes...');
  const cvTopicNodes = [{ article_id: "image-classification", title: "Image Classification Basics", celestial_type: "star", x: 7500.0, y: 2500.0, connections: [] }];
  const rogueNodes = [
      { article_id: "attention-paper", title: "Attention Is All You Need", celestial_type: "anomaly", x: 8000.0, y: 3000.0, connections: ["resnet-paper"] },
      { article_id: "resnet-paper", title: "Deep Residual Learning", celestial_type: "anomaly", x: 8500.0, y: 4000.0, connections: [] }
  ];

  const { error: mapErr } = await supabase.from('cosmos_maps').upsert([
    { id: cvTopicId, map_type: 'topic', theme: 'nebula', nodes: cvTopicNodes },
    { id: rogueId, map_type: 'rogue-anomalies', theme: 'nebula', nodes: rogueNodes }
  ]);
  if (mapErr) throw mapErr;
  
  console.log('✅ Content (Topics, Articles, Maps) seeded successfully!');
  process.exit(0);
}

seedContent();
