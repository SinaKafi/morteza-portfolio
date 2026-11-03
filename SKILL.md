# Build a Premium Developer Portfolio — Content-Driven & Unsplopped

Act as a Senior Frontend Engineer, Creative Developer, UI/UX Designer, and Motion Designer.

Your task is to transform this repository into a premium, highly polished personal portfolio for **Morteza Najafi**, using the provided `content/resume.md` as the single source of truth.

## 1. First: Inspect the Project

Before making changes:

- Inspect the existing project structure, framework, dependencies, and architecture.
- Identify the current content management approach.
- Inspect existing components, styling conventions, and assets.
- Read the complete `content/resume.md`.
- Check whether the `unslop` skill is available and read its instructions.
- Preserve useful existing infrastructure and avoid unnecessary rewrites.

Do not assume the project uses a particular framework. Work with its existing stack unless a strong technical reason justifies changing it.

## 2. Single Source of Truth — Critical Requirement

The Markdown resume must become the ONLY source of truth for all personal and professional content.

Implement a reliable content pipeline that:

- Parses `content/resume.md` programmatically.
- Generates structured content for the portfolio.
- Uses the generated data across every relevant page and component.
- Eliminates duplicated hardcoded personal information.
- Keeps projects, experience, skills, education, contact information, and professional summary synchronized.
- Supports updating the website simply by editing the Markdown file.
- Provides appropriate validation and sensible fallbacks for missing content.

Use TypeScript types for parsed content. Avoid `any`.

If the project contains generated agent documentation or SEO content, make sure those outputs also derive from the same source.

Do not manually duplicate resume information inside React components.

Important: Keep the Markdown as the canonical source. Generated files must never become independent sources of truth.

## 3. Design Direction

Create a premium, distinctive portfolio for an experienced Software Engineer.

Visual direction:

- Sophisticated glassmorphism.
- Dark, elegant visual foundation.
- Subtle translucent surfaces and layered depth.
- Carefully controlled blur, transparency, and reflections.
- Strong typography and intentional spacing.
- High-quality visual hierarchy.
- Minimal but distinctive visual identity.
- Premium editorial meets modern creative developer portfolio.

Avoid:

- Generic AI-generated portfolio aesthetics.
- Excessive purple gradients.
- Neon everywhere.
- Unnecessary glowing borders.
- Excessive rounded cards.
- Emoji-based UI.
- Overused bento layouts.
- Random decorative elements.
- Generic stock imagery.

The result should feel custom-designed, intentional, and professionally art-directed.

## 4. Motion & Advanced Interactions

Motion is a major part of this project.

Create sophisticated, smooth, and meaningful animations.

Explore:

- Physics-inspired gravity interactions.
- Magnetic buttons and interactive elements.
- Smooth scroll-based transitions.
- Scroll-triggered reveals.
- Subtle parallax effects.
- Spring-based transitions.
- Interactive glass surfaces.
- Layered depth and perspective.
- Sophisticated hover interactions.
- Animated typography.
- Smooth page transitions where appropriate.
- Subtle cursor interactions on desktop.

Gravity interactions should feel natural and physically believable, not gimmicky.

Use appropriate animation libraries already available in the project. If needed, evaluate Framer Motion / Motion or GSAP before adding dependencies.

Keep animations performant and avoid unnecessary React re-renders.

Respect `prefers-reduced-motion`, mobile performance, accessibility, and touch interactions.

## 5. Portfolio Structure

Create a cohesive experience with these sections:

### Hero

- Morteza Najafi
- Software Engineer
- Strong professional positioning.
- Short introduction derived from the resume.
- Clear contact and project navigation.
- Distinctive animated visual treatment.

### About

- Professional summary.
- Engineering philosophy.
- Technical ownership and leadership experience.

### Experience

- Timeline-based work experience.
- Company, role, dates, and location.
- Concise achievement-oriented descriptions.
- Clear visual hierarchy.

### Selected Projects

- Highlight meaningful projects.
- Derive project information from the Markdown source.
- Do not invent project metrics, clients, screenshots, or achievements.
- Use tasteful project visualizations and interactions.

### Technical Skills

- Categorized technical skills.
- Clean visual presentation.
- Avoid arbitrary skill percentages.

### Leadership

- Technical leadership.
- Team coordination.
- Mentoring.
- Engineering standards.

### Education

- Academic background and research experience.

### Contact

- Email and social links.
- Clear contact call to action.

## 6. Engineering Requirements

- Maintain clean component architecture.
- Use reusable components.
- Keep content parsing separate from presentation.
- Use strict TypeScript.
- Implement responsive layouts.
- Ensure SEO metadata is accurate.
- Add appropriate Open Graph metadata.
- Optimize images and fonts.
- Avoid unnecessary dependencies.
- Maintain accessibility.
- Ensure production build succeeds.
- Do not break existing functionality.

## 7. Unsplop Workflow

Use the installed `unslop` skill as a design quality process.

Follow its workflow:

1. Audit the existing UI and identify visual problems.
2. Establish a clear visual direction.
3. Review spacing, colors, typography, icons, layout, visuals, and motion.
4. Implement improvements systematically.
5. Review the final result and refine inconsistencies.

Do not blindly follow generic design conventions. Make decisions based on the identity of this portfolio.

If the skill requires approval of the proposed direction, present the direction before implementation.

## 8. Execution Strategy

Work in phases:

**Phase 1 — Audit & Architecture**
Inspect the repository and design the Markdown-to-content pipeline.

**Phase 2 — Content System**
Implement Markdown parsing, TypeScript schemas, validation, and generated content.

**Phase 3 — Design System**
Establish typography, colors, glass surfaces, spacing, and motion principles.

**Phase 4 — Portfolio Implementation**
Build all sections and responsive layouts.

**Phase 5 — Motion & Interactions**
Implement sophisticated animation and gravity-inspired interactions.

**Phase 6 — Unslop & Quality Review**
Audit the complete experience, refine visual details, and fix issues.

**Phase 7 — Final Verification**
Run lint, type checking, and production build. Fix any issues introduced by your changes.

## Final Expectations

The portfolio should look like the work of an experienced creative engineering team, not a generic AI-generated website.

Prioritize:

1. Design quality.
2. Content accuracy.
3. Strong visual identity.
4. Meaningful interactions.
5. Maintainable architecture.
6. Performance and accessibility.

Do not stop after creating a basic landing page. Deliver a complete, cohesive portfolio experience.

Start by auditing the repository and presenting your implementation plan. Then proceed with implementation in controlled phases.
