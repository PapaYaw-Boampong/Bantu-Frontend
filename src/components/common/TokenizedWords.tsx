import { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Plus, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Item types for drag and drop
const ItemTypes = {
  WORD: 'word',
};

// Interface for word token
interface WordToken {
  id: string;
  text: string;
}

// Interface for draggable word token props
interface DraggableWordTokenProps {
  id: string;
  text: string;
  index: number;
  moveToken: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onMergeWithNext: (id: string) => void;
  onSplitWord: (id: string) => void;
}

// Draggable word token component
const DraggableWordToken = ({
  id,
  text,
  index,
  moveToken,
  onEdit,
  onDelete,
  onMergeWithNext,
  onSplitWord,
}: DraggableWordTokenProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WORD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [, drop] = useDrop({
    accept: ItemTypes.WORD,
    hover: (item: { id: string; index: number }, monitor) => {
      if (!item) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      moveToken(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    onEdit(id, editedText);
    setIsEditing(false);
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditedText(text);
      setIsEditing(false);
    }
  };

  // Combine drag and drop refs
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      drag(drop(node));
    },
    [drag, drop]
  );

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center m-1 cursor-move',
        isDragging ? 'opacity-50' : 'opacity-100'
      )}
    >
      {isEditing ? (
        <div className="flex items-center">
          <Input
            ref={inputRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="h-8 min-w-[80px] px-2 py-1 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <Badge
          variant="outline"
          className="px-2 py-1 text-sm font-medium bg-background hover:bg-accent group relative"
        >
          <span>{text}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(id)}
          >
            <X className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleEdit}>Edit Word</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(id)}>Delete Word</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMergeWithNext(id)}>Merge with Next</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSplitWord(id)}>Split Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Badge>
      )}
    </div>
  );
};

// Interface for tokenized words props
interface TokenizedWordsProps {
  text: string;
  onChange: (text: string) => void;
}

// Main tokenized words component
const TokenizedWords = ({ text, onChange }: TokenizedWordsProps) => {
  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [history, setHistory] = useState<WordToken[][]>([]);
  const [originalTokens, setOriginalTokens] = useState<WordToken[]>([]);

  // Initialize tokens from text
  useEffect(() => {
    if (text && tokens.length === 0) {
      const initialTokens = text
        .split(/\s+/)
        .filter(word => word.trim() !== '')
        .map(word => ({
          id: Math.random().toString(36).substring(2, 9),
          text: word,
        }));
      setTokens(initialTokens);
      setOriginalTokens([...initialTokens]);
    }
  }, [text, tokens.length]);

  // Update text when tokens change
  useEffect(() => {
    const newText = tokens.map(token => token.text).join(' ');
    onChange(newText);
  }, [tokens, onChange]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, [...tokens]]);
  }, [tokens]);

  // Move token from one position to another
  const moveToken = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      saveToHistory();
      const draggedToken = tokens[dragIndex];
      const newTokens = [...tokens];
      newTokens.splice(dragIndex, 1);
      newTokens.splice(hoverIndex, 0, draggedToken);
      setTokens(newTokens);
    },
    [tokens, saveToHistory]
  );

  // Edit token text
  const handleEditToken = useCallback(
    (id: string, newText: string) => {
      saveToHistory();
      setTokens(prev =>
        prev.map(token => (token.id === id ? { ...token, text: newText } : token))
      );
    },
    [saveToHistory]
  );

  // Delete token
  const handleDeleteToken = useCallback(
    (id: string) => {
      saveToHistory();
      setTokens(prev => prev.filter(token => token.id !== id));
    },
    [saveToHistory]
  );

  // Add new token
  const handleAddToken = useCallback(
    (index: number) => {
      saveToHistory();
      const newToken = {
        id: Math.random().toString(36).substring(2, 9),
        text: '',
      };
      const newTokens = [...tokens];
      newTokens.splice(index + 1, 0, newToken);
      setTokens(newTokens);
    },
    [tokens, saveToHistory]
  );

  // Merge token with next
  const handleMergeWithNext = useCallback(
    (id: string) => {
      saveToHistory();
      const tokenIndex = tokens.findIndex(token => token.id === id);
      if (tokenIndex < tokens.length - 1) {
        const newTokens = [...tokens];
        const mergedText = `${newTokens[tokenIndex].text} ${newTokens[tokenIndex + 1].text}`;
        newTokens[tokenIndex].text = mergedText;
        newTokens.splice(tokenIndex + 1, 1);
        setTokens(newTokens);
      }
    },
    [tokens, saveToHistory]
  );

  // Split token
  const handleSplitWord = useCallback(
    (id: string) => {
      saveToHistory();
      const tokenIndex = tokens.findIndex(token => token.id === id);
      const tokenText = tokens[tokenIndex].text;
      const splitIndex = Math.floor(tokenText.length / 2);
      
      if (splitIndex > 0) {
        const firstPart = tokenText.substring(0, splitIndex);
        const secondPart = tokenText.substring(splitIndex);
        
        const newTokens = [...tokens];
        newTokens[tokenIndex].text = firstPart;
        
        const newToken = {
          id: Math.random().toString(36).substring(2, 9),
          text: secondPart,
        };
        
        newTokens.splice(tokenIndex + 1, 0, newToken);
        setTokens(newTokens);
      }
    },
    [tokens, saveToHistory]
  );

  // Undo last action
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setTokens(lastState);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  // Reset to original
  const handleReset = useCallback(() => {
    setTokens([...originalTokens]);
    setHistory([]);
  }, [originalTokens]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex flex-wrap p-4 min-h-[100px] border rounded-md bg-background">
          {tokens.map((token, index) => (
            <DraggableWordToken
              key={token.id}
              id={token.id}
              text={token.text}
              index={index}
              moveToken={moveToken}
              onEdit={handleEditToken}
              onDelete={handleDeleteToken}
              onMergeWithNext={handleMergeWithNext}
              onSplitWord={handleSplitWord}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 py-1 ml-1"
            onClick={() => handleAddToken(tokens.length - 1)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Word
          </Button>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </DndProvider>
  );
};

export default TokenizedWords; 