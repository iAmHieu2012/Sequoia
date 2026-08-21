import { supabase } from './seed_client';

async function seedTextbooks() {
  console.log('Seeding Textbooks...');

  const textbooks = [
    // --- NỀN TẢNG & TOÁN HỌC (FOUNDATIONS & MATH) ---
    {
      id: "mathematics-for-machine-learning",
      title: "Mathematics for Machine Learning",
      description: "The fundamental mathematical tools needed to understand machine learning.",
      authors: ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/mathematics-for-machine-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/mathematics-for-machine-learning.pdf",
      sort_order: 1
    },
    {
      id: "artificial-intelligence-a-modern-approach",
      title: "Artificial Intelligence: A Modern Approach",
      description: "The definitive and most comprehensive introduction to the theory and practice of artificial intelligence.",
      authors: ["Stuart Russell", "Peter Norvig"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/artificial-intelligence-a-modern-approach.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/artificial-intelligence-a-modern-approach.pdf",
      sort_order: 2
    },
    {
      id: "foundations-of-machine-learning",
      title: "Foundations of Machine Learning",
      description: "A graduate-level introduction to concepts and algorithmic tools in machine learning.",
      authors: ["Mehryar Mohri", "Afshin Rostamizadeh", "Ameet Talwalkar"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/foundations-of-machine-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/foundations-of-machine-learning.pdf",
      sort_order: 3
    },

    // --- HỌC MÁY CỐT LÕI (PROBABILISTIC ML) ---
    {
      id: "probabilistic-machine-learning-an-introduction",
      title: "Probabilistic Machine Learning: An Introduction",
      description: "A comprehensive introduction to machine learning that uses probabilistic models and inference as a unifying approach.",
      authors: ["Kevin P. Murphy"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/probabilistic-machine-learning-an-introduction.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/probabilistic-machine-learning-an-introduction.pdf",
      sort_order: 4
    },
    {
      id: "probabilistic-machine-learning-advanced-topics",
      title: "Probabilistic Machine Learning: Advanced Topics",
      description: "Advanced topics in probabilistic machine learning, continuing from the introductory text.",
      authors: ["Kevin P. Murphy"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/probabilistic-machine-learning-advanced-topics.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/probabilistic-machine-learning-advanced-topics.pdf",
      sort_order: 5
    },

    // --- TỐI ƯU HÓA VÀ RA QUYẾT ĐỊNH (OPTIMIZATION & DECISION MAKING) ---
    {
      id: "algorithms-for-optimization",
      title: "Algorithms for Optimization",
      description: "A comprehensive introduction to optimization with a focus on practical algorithms.",
      authors: ["Mykel J. Kochenderfer", "Tim A. Wheeler"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/algorithms-for-optimization.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/algorithms-for-optimization.pdf",
      sort_order: 6
    },
    {
      id: "algorithms-for-decision-making",
      title: "Algorithms for Decision Making",
      description: "A broad introduction to algorithms for decision making under uncertainty.",
      authors: ["Mykel J. Kochenderfer", "Tim A. Wheeler", "Kyle Wray"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/algorithms-for-decision-making.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/algorithms-for-decision-making.pdf",
      sort_order: 7
    },
    {
      id: "algorithms-for-validation",
      title: "Algorithms for Validation",
      description: "Techniques and algorithms for validating complex systems and models.",
      authors: ["Mykel J. Kochenderfer"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/algorithms-for-validation.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/algorithms-for-validation.pdf",
      sort_order: 8
    },

    // --- HỌC SÂU (DEEP LEARNING) ---
    {
      id: "deep-learning",
      title: "Deep Learning",
      description: "The foundational textbook on Deep Learning, covering mathematical background, modern techniques, and research.",
      authors: ["Ian Goodfellow", "Yoshua Bengio", "Aaron Courville"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/deep-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/deep-learning.pdf",
      sort_order: 9
    },
    {
      id: "understanding-deep-learning",
      title: "Understanding Deep Learning",
      description: "An intuitive and highly visual introduction to modern deep learning architectures and mechanics.",
      authors: ["Simon J.D. Prince"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/understanding-deep-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/understanding-deep-learning.pdf",
      sort_order: 10
    },

    // --- XỬ LÝ NGÔN NGỮ & HỆ THỐNG & ĐẠO ĐỨC (NLP & SYSTEMS & ETHICS) ---
    {
      id: "speech-and-language-processing",
      title: "Speech and Language Processing",
      description: "The classic textbook for Natural Language Processing (NLP), computational linguistics, and speech recognition.",
      authors: ["Dan Jurafsky", "James H. Martin"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/speech-and-language-processing.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/speech-and-language-processing.pdf",
      sort_order: 11
    },
    {
      id: "introduction-to-machine-learning-systems",
      title: "Introduction to Machine Learning Systems",
      description: "Bridging the gap between ML models and production-ready software systems.",
      authors: ["Vijay Janapa Reddi"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/introduction-to-machine-learning-systems.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/introduction-to-machine-learning-systems.pdf",
      sort_order: 12
    },
    {
      id: "machine-learning-systems-at-scale",
      title: "Machine Learning Systems at Scale",
      description: "Designing, deploying, and maintaining machine learning pipelines in large-scale environments.",
      authors: ["Vijay Janapa Reddi"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/machine-learning-systems-at-scale.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/machine-learning-systems-at-scale.pdf",
      sort_order: 13
    },
    {
      id: "fairness-and-machine-learning-limitations-and-opportunities",
      title: "Fairness and Machine Learning: Limitations and Opportunities",
      description: "Exploring the social consequences of machine learning and how to build fairer systems.",
      authors: ["Solon Barocas", "Moritz Hardt", "Arvind Narayanan"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/fairness-and-machine-learning-limitations-and-opportunities.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/fairness-and-machine-learning-limitations-and-opportunities.pdf",
      sort_order: 14
    },

    // --- HỌC TĂNG CƯỜNG VÀ TÁC TỬ (REINFORCEMENT LEARNING & AGENTS) ---
    {
      id: "reinforcement-learning-an-introduction",
      title: "Reinforcement Learning: An Introduction",
      description: "The gold standard introduction to reinforcement learning concepts and algorithms.",
      authors: ["Richard S. Sutton", "Andrew G. Barto"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/reinforcement-learning-an-introduction.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/reinforcement-learning-an-introduction.pdf",
      sort_order: 15
    },
    {
      id: "distributional-reinforcement-learning",
      title: "Distributional Reinforcement Learning",
      description: "Advanced RL focusing on the full distribution of future rewards rather than just the expected value.",
      authors: ["Marc G. Bellemare", "Will Dabney", "Mark Rowland"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/distributional-reinforcement-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/distributional-reinforcement-learning.pdf",
      sort_order: 16
    },
    {
      id: "multi-agent-reinforcement-learning",
      title: "Multi-Agent Reinforcement Learning",
      description: "Foundations and algorithms for training multiple interacting autonomous agents.",
      authors: ["Stefano V. Albrecht", "Filippos Christianos", "Lukas Schäfer"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/multi-agent-reinforcement-learning.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/multi-agent-reinforcement-learning.pdf",
      sort_order: 17
    },
    {
      id: "agents-in-the-long-game-of-ai",
      title: "Agents in the Long Game of AI",
      description: "An exploration of long-term planning, autonomous agents, and their role in the future of AI.",
      authors: ["Marjorie McShane, Sergei Nirenburg, Jesse English"],
      cover_image_url: "https://cdn.jsdelivr.net/gh/iAmHieu2012/sequoia-assets@main/covers/agents-in-the-long-game-of-ai.jpg",
      pdf_url: "https://rawcdn.githack.com/iAmHieu2012/sequoia-assets/09d4646ba5c44e70bc38666374927ecbb4d573bd/pdfs/agents-in-the-long-game-of-ai.pdf",
      sort_order: 18
    }
  ];

  // Upsert toàn bộ array
  const { error: txtErr } = await supabase.from('textbooks').upsert(textbooks);
  
  if (txtErr) {
    console.error('❌ Error seeding textbooks:', txtErr);
    throw txtErr;
  }
  
  console.log(`✅ Successfully seeded ${textbooks.length} textbooks!`);
  process.exit(0);
}

seedTextbooks();