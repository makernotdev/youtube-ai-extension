// prettier-ignore
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSummary } from "@/contexts/summary-context"
import { prompts, type Prompt } from "@/lib/constants"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { CheckIcon, ClipboardCopyIcon, ReloadIcon } from "@radix-ui/react-icons"

import { Button } from "./ui/button"
import { TooltipWrapper } from "./ui/tooltip-wrapper"

import * as React from "react"
import ExtensionModel from './extension-model'

interface SummaryActionsProps {}

export default function SummaryActions({}: SummaryActionsProps) {
  const {
    summaryPrompt,
    summaryIsGenerating,
    summaryContent,
    setSummaryPrompt,
    generateSummary
  } = useSummary()

  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000
  })

  function CopySummary() {
    if (isCopied || !summaryContent || summaryIsGenerating) return
    copyToClipboard(summaryContent)
  }

  return (
    <div className="flex flex-row w-full justify-between items-center sticky top-0 z-10 bg-white dark:bg-[#0f0f0f] pt-3.5 pb-2 px-3">
      <ExtensionModel />

      <div className="flex flex-row space-x-2">
        <TooltipWrapper text="Regenerate Summary">
          <Button
            variant="outline"
            size="icon"
            onClick={generateSummary}
            disabled={summaryIsGenerating}>
            <ReloadIcon className="h-4 w-4 opacity-60" />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper text="Copy Summary">
          <Button
            variant="outline"
            size="icon"
            onClick={CopySummary}
            disabled={summaryIsGenerating}>
            {isCopied ? (
              <CheckIcon className="h-4.5 w-4.5 opacity-60" />
            ) : (
              <ClipboardCopyIcon className="h-4 w-4 opacity-60" />
            )}
          </Button>
        </TooltipWrapper>

        <Select
          value={summaryPrompt.value}
          onValueChange={(value) =>
            setSummaryPrompt(prompts.find((prompt) => prompt.value === value))
          }>
          <SelectTrigger className="w-fit space-x-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt: Prompt) => (
              <SelectItem key={prompt.value} value={prompt.value}>
                {prompt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
