import pptxgen from 'pptxgenjs';

const GITHUB_URL = 'https://github.com/ayushap18/ChainCash';
const DEPLOY_URL = 'https://chain-cash-two.vercel.app/';

const COLORS = {
  bg: '313647',
  panel: '435663',
  accent: 'A3B087',
  text: 'FFF8D4'
};

function addHeader(slide, title, subtitle) {
  slide.background = { color: COLORS.bg };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.0,
    y: 0.0,
    w: 13.333,
    h: 0.75,
    fill: { color: COLORS.panel, transparency: 20 },
    line: { color: COLORS.panel, transparency: 100 }
  });

  slide.addText(title, {
    x: 0.6,
    y: 0.16,
    w: 12.2,
    h: 0.4,
    fontFace: 'Calibri',
    fontSize: 24,
    bold: true,
    color: COLORS.text
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.72,
      w: 12.2,
      h: 0.4,
      fontFace: 'Calibri',
      fontSize: 14,
      color: COLORS.text,
      transparency: 15
    });
  }
}

function addBullets(slide, x, y, w, h, lines) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.panel, transparency: 25 },
    line: { color: COLORS.panel, transparency: 70 },
    radius: 10
  });

  const textRuns = lines
    .map((t) => ({
      text: t,
      options: {
        bullet: { indent: 18 },
        hanging: 6
      }
    }))
    .flatMap((r, i) => (i === 0 ? [r] : [{ text: '\n', options: {} }, r]));

  slide.addText(textRuns, {
    x: x + 0.35,
    y: y + 0.25,
    w: w - 0.7,
    h: h - 0.5,
    fontFace: 'Calibri',
    fontSize: 18,
    color: COLORS.text
  });
}

const pptx = new pptxgen();

pptx.layout = 'LAYOUT_WIDE';

pptx.author = 'ChainCash';
pptx.company = 'ChainCash';
pptx.subject = 'Crowdfunding on Ergo with NFT rewards';
pptx.title = 'ChainCash Pitch Deck';

// Slide 1: Title
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  slide.addText('ChainCash', {
    x: 0.9,
    y: 1.4,
    w: 12,
    h: 1,
    fontFace: 'Calibri',
    fontSize: 56,
    bold: true,
    color: COLORS.text
  });

  slide.addText('Fund games. Own the future.', {
    x: 0.95,
    y: 2.35,
    w: 12,
    h: 0.6,
    fontFace: 'Calibri',
    fontSize: 24,
    color: COLORS.accent
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.95,
    y: 3.3,
    w: 11.5,
    h: 1.4,
    fill: { color: COLORS.panel, transparency: 20 },
    line: { color: COLORS.panel, transparency: 70 },
    radius: 14
  });

  slide.addText(`Deployed: ${DEPLOY_URL}\nGitHub: ${GITHUB_URL}`, {
    x: 1.25,
    y: 3.55,
    w: 11,
    h: 1,
    fontFace: 'Calibri',
    fontSize: 16,
    color: COLORS.text
  });

  slide.addText('Tech: Next.js • TypeScript • Tailwind • Zustand • Prisma • Ergo/Nautilus', {
    x: 0.95,
    y: 5.1,
    w: 12,
    h: 0.4,
    fontFace: 'Calibri',
    fontSize: 14,
    color: COLORS.text,
    transparency: 15
  });
}

// Slide 2: Problem
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Problem', 'Indie games struggle to raise capital and reward early supporters');

  addBullets(slide, 0.9, 1.6, 11.6, 4.6, [
    'Traditional crowdfunding offers limited ownership and weak secondary markets',
    'Supporters want provable badges/collectibles and transparent funding flows',
    'Creators need a simple way to launch campaigns and manage rewards',
    'Blockchain UX can be complex without wallet-native flows'
  ]);
}

// Slide 3: Solution
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Solution', 'Crowdfunding on Ergo with reward NFTs + a marketplace experience');

  addBullets(slide, 0.9, 1.6, 11.6, 4.6, [
    'Back campaigns with ERG using Nautilus wallet integration',
    'Earn NFT-style supporter badges and collectible reward assets',
    'Browse campaigns, view details, and track progress with a creator dashboard UI',
    'Marketplace-style UI (with optional 3D scene) to showcase assets'
  ]);
}

// Slide 4: Key Features
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Key Features', 'What users can do in the product');

  addBullets(slide, 0.9, 1.45, 11.6, 2.55, [
    'Connect wallet (Nautilus) and view balance/address info',
    'Explore active campaigns, goals, and reward tiers',
    'Campaign detail page with about/milestones/rewards tabs'
  ]);

  addBullets(slide, 0.9, 4.2, 11.6, 2.35, [
    'Marketplace to browse reward assets and add to cart',
    'My Assets page to view owned items/badges',
    'Dashboard page for campaign creation & tracking (UI + APIs)'
  ]);
}

// Slide 5: Tech Stack / Architecture
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Tech Stack', 'Modern web stack with Ergo integration');

  addBullets(slide, 0.9, 1.6, 11.6, 4.6, [
    'Frontend: Next.js App Router, React, TypeScript, Tailwind v4, Framer Motion',
    'State: Zustand stores for wallet, campaigns, cart',
    'Backend: Next.js API routes; Prisma schema for persistence',
    'Ergo: services for address/info/transactions + Nautilus wallet UX',
    '3D (optional): React Three Fiber + Drei for marketplace visuals'
  ]);
}

// Slide 6: Demo Flow
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Demo Flow', 'Suggested 2–3 minute walkthrough');

  addBullets(slide, 0.9, 1.6, 11.6, 4.6, [
    'Open Home → browse active campaigns',
    'Open a campaign → view rewards and details',
    'Go to Marketplace → browse assets and add to cart',
    'Open My Assets → view owned items (demo data)',
    'Show deployed link and repo link'
  ]);
}

// Slide 7: AI Usage
{
  const slide = pptx.addSlide();
  addHeader(slide, 'AI Tools Usage', 'How AI accelerated development (transparent + safe)');

  addBullets(slide, 0.9, 1.6, 11.6, 4.6, [
    'Used GitHub Copilot (GPT-5.2 Preview) for faster UI iteration and refactoring',
    'Applied a consistent theme across pages/components and improved contrast',
    'Helped debug runtime errors by adding defensive fallbacks and safer rendering',
    'Assisted with TypeScript typings, component composition, and build verification'
  ]);
}

// Slide 8: Future Scope + Links
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Future Scope', 'What we’d build next');

  addBullets(slide, 0.9, 1.55, 11.6, 3.1, [
    'On-chain pledging flow + signed transactions in Nautilus',
    'NFT minting/redemption for reward tiers',
    'Creator tools: milestones, updates, analytics, moderation'
  ]);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9,
    y: 4.9,
    w: 11.6,
    h: 1.6,
    fill: { color: COLORS.panel, transparency: 25 },
    line: { color: COLORS.panel, transparency: 70 },
    radius: 12
  });

  slide.addText('Links', {
    x: 1.25,
    y: 5.1,
    w: 11,
    h: 0.35,
    fontFace: 'Calibri',
    fontSize: 18,
    bold: true,
    color: COLORS.text
  });

  slide.addText(`Deployed: ${DEPLOY_URL}\nGitHub: ${GITHUB_URL}`, {
    x: 1.25,
    y: 5.45,
    w: 11,
    h: 0.9,
    fontFace: 'Calibri',
    fontSize: 16,
    color: COLORS.text
  });
}

await pptx.writeFile({ fileName: 'ChainCash.pptx' });
console.log('Generated ChainCash.pptx');
