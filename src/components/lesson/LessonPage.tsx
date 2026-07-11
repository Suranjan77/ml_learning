"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesCombined,
  Code2,
  Lightbulb,
  Sigma,
} from "lucide-react";
import { LearningModule } from "@/data/algorithms_content/learningModuleTypes";
import CodeBlock from "@/components/ui/CodeBlock";
import InlineMarkdown from "@/components/ui/InlineMarkdown";
import LogicContent from "@/components/ui/LogicContent";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import TheaterMode from "@/components/ui/TheaterMode";
import { VisualizationErrorBoundary } from "@/components/ui/visualizations/VisualizationErrorBoundary";
import {
  getAccentClasses,
  getCategoryColor,
  getCategoryLabel,
  getCategoryRoute,
} from "@/lib/algorithmPresentation";

// Lesson section components
import PrerequisiteLinks from "./PrerequisiteLinks";
import NotationTable from "./NotationTable";
import Misconceptions from "./Misconceptions";
import ReferenceList from "./ReferenceList";
import RelatedModules from "./RelatedModules";
import ModuleNavigation from "./ModuleNavigation";
import MetadataBar from "./MetadataBar";
import LessonNavigator from "./LessonNavigator";
import TLDR from "./TLDR";
import LearningObjectives from "./LearningObjectives";
import ComparisonTable from "./ComparisonTable";
import WhenToUse from "./WhenToUse";
import CaseStudy from "./CaseStudy";
import SelfCheckQuiz from "./SelfCheckQuiz";

interface LessonPageProps {
  module: LearningModule;
  allModules: LearningModule[];
}

export default function LessonPage({ module, allModules }: LessonPageProps) {
  const categoryRoute = getCategoryRoute(module.category);
  const categoryLabel = getCategoryLabel(module.category);
  const accent = getAccentClasses(getCategoryColor(module.category));
  const [isMathOpen, setIsMathOpen] = useState(false);

  return (
    <div className="relative px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[15px] text-on-surface-variant/70 sm:mb-8">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-outline-variant">›</span>
          <Link href={categoryRoute} className="transition-colors hover:text-primary">
            {categoryLabel}
          </Link>
          <span className="text-outline-variant">›</span>
          <span className="font-medium text-on-surface-variant">
            {module.title}
          </span>
        </nav>

        {/* Header Jumbotron */}
        <div className="mb-8 border border-outline bg-surface-container-low p-5 sm:mb-10 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center px-4 py-2 text-sm font-medium tracking-wide sm:py-1.5 ${accent.badge}`}>
              {categoryLabel}
            </div>
          </div>

          <h1 className="mb-5 max-w-4xl text-balance font-headline text-[2.35rem] font-semibold leading-tight tracking-normal text-on-surface sm:text-5xl lg:text-6xl">
            {module.title}
          </h1>
          
          <MetadataBar 
            difficulty={module.difficulty}
            estimatedMinutes={module.estimatedMinutes}
            tracks={module.tracks}
          />
          
          <InlineMarkdown
            content={module.shortDescription}
            className="mt-4 block max-w-4xl text-[17px] leading-relaxed text-on-surface-variant sm:text-lg"
          />
        </div>

        {/* Prerequisites */}
        <PrerequisiteLinks prerequisites={module.prerequisites} allModules={allModules} />
      </section>

      <LessonNavigator currentModule={module} allModules={allModules} />

      {/* Stacked content sections */}
      <section className="relative z-10 mx-auto max-w-6xl space-y-8">

        {/* Quick review */}
        <TLDR points={module.tldr} />

        {/* Interactive Visualization Section — leads the lesson */}
        {module.hasVisualization !== false && (
          <div
            id="visualization"
            className="scroll-mt-32 lg:scroll-mt-48 overflow-hidden border border-outline bg-surface-container-low"
          >
            <div className="border-b border-outline bg-surface-container px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
                  <ChartNoAxesCombined size={18} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                    Interactive Diagram
                  </h2>
                  <p className="text-sm text-on-surface-variant/70">
                    Start here — play with the model, then read on to understand what you saw
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-2 sm:p-6">
              <TheaterMode title={module.title}>
                <div className="min-h-[380px]">
                  <VisualizationErrorBoundary algorithmId={module.id}>
                    <AlgorithmVisualization algorithmId={module.id} />
                  </VisualizationErrorBoundary>
                </div>
              </TheaterMode>
            </div>
          </div>
        )}

        <LearningObjectives objectives={module.learningObjectives} />

        {/* Intuition Section */}
        {module.intuition && (
          <div
            id="intuition"
            className="scroll-mt-32 lg:scroll-mt-48 overflow-hidden border border-outline bg-surface-container-low"
          >
            <div className="border-b border-outline px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-tertiary/30 bg-tertiary/12 text-tertiary">
                  <Lightbulb size={18} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                    Intuition
                  </h2>
                  <p className="text-sm text-on-surface-variant/70">
                    How to think conceptually about this topic
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <LogicContent content={module.intuition} />
              </div>
            </div>
          </div>
        )}

        {/* Mathematics Section — folded "go deeper" layer */}
        {module.mathematics && (
          <div
            id="mathematics"
            className="scroll-mt-32 lg:scroll-mt-48 overflow-hidden border border-outline bg-surface-container-low"
          >
            <button
              onClick={() => setIsMathOpen(!isMathOpen)}
              aria-expanded={isMathOpen}
              className="flex w-full items-center justify-between border-b border-outline px-6 py-5 sm:px-8 text-left transition-colors hover:bg-surface-container-high focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
                  <Sigma size={18} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                    The Mathematics
                  </h2>
                  <p className="text-sm text-on-surface-variant/70">
                    Go deeper — notation, formal formulations, and derivations
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                {isMathOpen ? "Hide" : "Show math"}
              </span>
            </button>
            {isMathOpen && (
              <div className="px-6 py-5 sm:px-8">
                <NotationTable notationTable={module.notationTable} />
                <LogicContent content={module.mathematics} />
              </div>
            )}
          </div>
        )}

        {/* In-Depth Description Section */}
        <div
          id="depth"
          className="scroll-mt-32 lg:scroll-mt-48 overflow-hidden border border-outline bg-surface-container-low"
        >
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-secondary/30 bg-secondary/12 text-secondary">
                <BookOpen size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  In Depth
                </h2>
                <p className="text-sm text-on-surface-variant/70">
                  Detailed explanations, contexts, and details
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={module.fullDescription} />
            </div>
          </div>
        </div>

        {/* Method Comparison */}
        <ComparisonTable comparisons={module.comparisons} />

        {/* When to Use / When Not to Use */}
        <WhenToUse guidance={module.usageGuidance} />

        {/* Implementation / Code Section */}
        {module.codeSnippet && (
          <div
            id="implementation"
            className="scroll-mt-32 lg:scroll-mt-48 overflow-hidden border border-outline bg-surface-container-low"
          >
            <div className="border-b border-outline px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-outline-variant/30 bg-outline-variant/10 text-on-surface">
                  <Code2 size={18} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                    Implementation
                  </h2>
                  <p className="text-sm text-on-surface-variant/70">
                    Reference code implementation
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <CodeBlock code={module.codeSnippet} />
              </div>
            </div>
          </div>
        )}

        {/* Pros and Cons (Strengths and Limitations) Section */}
        {((module.pros && module.pros.length > 0) || (module.cons && module.cons.length > 0)) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {module.pros && module.pros.length > 0 && (
              <div className="rounded-lg border border-outline bg-surface-container-low accent-left-success p-5">
                <h3 className="text-sm font-semibold tracking-wide text-success uppercase">
                  Strengths & Advantages
                </h3>
                <ul className="mt-4 list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {module.pros.map((pro, i) => (
                    <li key={i}>
                      <InlineMarkdown content={pro} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {module.cons && module.cons.length > 0 && (
              <div className="rounded-lg border border-outline bg-surface-container-low accent-left-error p-5">
                <h3 className="text-sm font-semibold tracking-wide text-error uppercase">
                  Limitations & Drawbacks
                </h3>
                <ul className="mt-4 list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {module.cons.map((con, i) => (
                    <li key={i}>
                      <InlineMarkdown content={con} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Real-World Case Studies */}
        <div id="case-studies" className="scroll-mt-32 lg:scroll-mt-48">
          <CaseStudy studies={module.caseStudies} />
        </div>

        {/* Misconceptions */}
        <Misconceptions misconceptions={module.misconceptions} />

        {/* Self-Check Quiz */}
        <div id="quiz" className="scroll-mt-32 lg:scroll-mt-48">
          <SelfCheckQuiz questions={module.quiz} shortAnswerQuestions={module.shortAnswerQuestions} />
        </div>

        {/* References */}
        <div id="references" className="scroll-mt-32 lg:scroll-mt-48">
          <ReferenceList references={module.references} />
        </div>

        {/* Related Modules */}
        <RelatedModules relatedModules={module.relatedModules} allModules={allModules} />

        {/* Module Navigation links */}
        <ModuleNavigation currentModule={module} allModules={allModules} />

      </section>
    </div>
  );
}
