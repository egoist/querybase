import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'
import { Range } from '@codemirror/state'
import { IdentifyResult } from 'sql-query-identifier/lib/defines'
import { identifyQueryQuiet } from './database'

const lineDeco = Decoration.line({ class: 'cm-activeLine' })

const countSpacesFromPos = (str: string, pos: number) => {
  let count = 0
  for (let i = pos; i < str.length; i++) {
    if (str[i] === ' ') count++
    else break
  }
  return count
}

export const highlightNearestStatementExtension = ({
  setNearestQuery
}: {
  setNearestQuery: (query: string) => void
}) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.getDeco(view)
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) this.decorations = this.getDeco(update.view)
      }

      getDeco(view: EditorView) {
        const deco: Range<Decoration>[] = []

        const selectedText = view.state.doc.sliceString(
          view.state.selection.main.from,
          view.state.selection.main.to
        )
        if (selectedText) {
          return Decoration.set(deco)
        }

        const text = view.state.doc.sliceString(0, view.state.doc.length)
        const statements = identifyQueryQuiet(text)

        let nearestStatement: IdentifyResult | undefined

        for (const statement of statements) {
          const spacesCount = countSpacesFromPos(text, statement.end + 1)

          if (
            statement.start <= view.state.selection.main.from &&
            statement.end + 1 + spacesCount >= view.state.selection.main.to
          ) {
            nearestStatement = {
              ...statement,
              end: statement.end + 1 + spacesCount
            }
            break
          }
        }

        setNearestQuery(nearestStatement?.text || '')

        if (nearestStatement) {
          // iterate through each line to check if it's in the range of the nearest statement
          for (let line = 1; line <= view.state.doc.lines; line++) {
            const lineText = view.state.doc.line(line)
            const lineStart = lineText.from
            let lineEnd = lineText.to

            if (lineStart >= nearestStatement.start && lineEnd <= nearestStatement.end) {
              deco.push(lineDeco.range(lineStart))
            }
          }
        }

        return Decoration.set(deco)
      }
    },
    {
      decorations: (v) => v.decorations
    }
  )
