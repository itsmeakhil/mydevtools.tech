"use client"

import React, { useEffect, useRef } from "react"
import {
  Eye,
  EyeOff,
  List,
  ListOrdered,
  Plus,
  Table as TableIcon,
} from "lucide-react"

import { Button } from "../button"
import { ButtonGroup } from "../button-group"
import { CardContent } from "../card"
import { Separator } from "../separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip"
import { MediaUploadPopover } from "./media-upload-popover"

interface EditorToolbarProps {
  isUploading: boolean
  readOnly?: boolean
  onReadOnlyChange?: (readOnly: boolean) => void
  onImageUploadClick: () => void
  onMultipleImagesUploadClick: () => void
  onVideoUploadClick: () => void
  onInsertComponentClick: () => void
  onCreateList: (listType: "ul" | "ol" | "li") => void
  onCreateTable: () => void
}

export function EditorToolbar({
  isUploading,
  readOnly = false,
  onReadOnlyChange,
  onImageUploadClick,
  onMultipleImagesUploadClick,
  onVideoUploadClick,
  onInsertComponentClick,
  onCreateList,
  onCreateTable,
}: EditorToolbarProps) {
  // Toolbar hidden as requested by user
  return null;
}
