import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('Initializing Sequoia Seed Sequence (Restored Firebase Parity - Fixes applied)...');

  console.log('Clearing existing databanks...');
  const { data: users } = await supabase.auth.admin.listUsers();
  if (users?.users) {
    for (const u of users.users) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }
  
  await supabase.from('topics').delete().neq('id', 'dummy'); 
  await supabase.from('models').delete().neq('id', 'dummy');
  await supabase.from('textbooks').delete().neq('id', 'dummy');
  await supabase.from('cosmos_maps').delete().neq('id', 'dummy');
  await supabase.from('articles').delete().neq('id', 'dummy');
  await supabase.from('article_contents').delete().neq('id', 'dummy');
  await supabase.from('users').delete().neq('id', 'dummy');

  console.log('Seeding Users...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'test@sequoia.ai',
    password: 'Password@123',
    email_confirm: true,
    user_metadata: { name: 'Test User', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    app_metadata: { is_admin: true }
  });

  let userId = '';
  if (authError && authError.message.includes('already exists')) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === 'test@sequoia.ai');
    if (existing) userId = existing.id;
  } else if (authData?.user) {
    userId = authData.user.id;
  }
  
  if (!userId) {
    throw new Error('Could not determine userId for test@sequoia.ai');
  }

  // Wait for trigger
  await new Promise(resolve => setTimeout(resolve, 1000));
  const now = new Date().toISOString();

  console.log('Seeding Models...');
  const models = [
    { id: "yolov8n-detect", name: "YOLOv8 Nano (Detect)", description: "Real-time object detection model optimized for edge devices.", task_type: "object-detection", file_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-detect/model.tflite", metadata_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-detect/metadata.json", file_size_bytes: 12841243, version: "1.0", format: "litert" },
    { id: "yolov8n-cls", name: "YOLOv8 Nano (Classify)", description: "Image classification model for edge devices.", task_type: "image-classification", file_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-cls/model.tflite", metadata_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-cls/metadata.json", file_size_bytes: 10917171, version: "1.0", format: "litert" },
    { id: "yolov8n-pose", name: "YOLOv8 Nano (Pose)", description: "Real-time human pose estimation model.", task_type: "pose-estimation", file_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-pose/model.tflite", metadata_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-pose/metadata.json", file_size_bytes: 13510234, version: "1.0", format: "litert" },
    { id: "yolov8n-seg", name: "YOLOv8 Nano (Seg)", description: "Real-time instance segmentation model.", task_type: "instance-segmentation", file_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-seg/model.tflite", metadata_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-models@main/yolov8n-seg/metadata.json", file_size_bytes: 13876205, version: "1.0", format: "litert" }
  ];
  const { error: mErr } = await supabase.from('models').upsert(models);
  if (mErr) throw mErr;

  console.log('Seeding Textbooks...');
  const textbook = { id: "mml", title: "Mathematics for Machine Learning", description: "The fundamental mathematical tools needed to understand machine learning.", authors: ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"], cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/mml.jpg", pdf_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/pdfs/mml.pdf", sort_order: 1 };
  const { error: txtErr } = await supabase.from('textbooks').upsert([textbook]);
  if (txtErr) throw txtErr;

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
  
  console.log('Seeding User Progress...');
  const userProgress = {
      current_streak: 5,
      longest_streak: 5,
      active_dates: ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"],
      completed_article_ids: ["image-classification", "attention-paper"],
      last_active: now
  };
  const { error: progErr } = await supabase.from('user_progress').update(userProgress).eq('id', userId);
  if (progErr) throw progErr;

  console.log('✅ Seeding completed successfully!');
  console.log('TEST CREDENTIALS: test@sequoia.ai / Password@123');
  process.exit(0);
}

seed();
