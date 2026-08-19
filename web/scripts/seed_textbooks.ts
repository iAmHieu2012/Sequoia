import { supabase } from './seed_client';

async function seedTextbooks() {
  console.log('Seeding Textbooks...');
  const textbook = { id: "mml", title: "Mathematics for Machine Learning", description: "The fundamental mathematical tools needed to understand machine learning.", authors: ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"], cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/mml.jpg", pdf_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/pdfs/mml.pdf", sort_order: 1 };
  const { error: txtErr } = await supabase.from('textbooks').upsert([textbook]);
  if (txtErr) throw txtErr;
  console.log('✅ Textbooks seeded successfully!');
  process.exit(0);
}

seedTextbooks();
