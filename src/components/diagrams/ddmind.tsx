import { Caption, DiagramFrame, Edge, Node, NoteText } from "./primitives";

// Row 1: the grid reads pages from a client cache that fetches from the paged API.
// Row 2: main content loads first, then tabs are prefetched in the background and cached.
export function DdmindDiagram({ label }: { label: string }) {
  return (
    <DiagramFrame label={label} width={840} height={296}>
      <Caption x={16} y={20}>
        GRID DATA FLOW
      </Caption>

      <Node x={16} y={36} w={176} title="Browser" subtitle="user scrolls" />
      <Node x={228} y={36} w={176} title="Virtualized grid" subtitle="renders visible rows" titleSize={14} />
      <Node x={440} y={36} w={176} title="Page cache" subtitle="keeps fetched pages" />
      <Node x={652} y={36} w={176} title="Paged API" subtitle="one page at a time" />

      <Edge from={[192, 64]} to={[228, 64]} />
      <Edge from={[404, 64]} to={[440, 64]} label="needs a page" />
      <Edge from={[616, 64]} to={[652, 64]} label="on cache miss" />

      <Caption x={16} y={158}>
        TABS
      </Caption>

      <Node x={16} y={174} w={196} title="Main content" subtitle="loads first" />
      <Node x={248} y={174} w={224} title="Background prefetch" subtitle="after a delay" titleSize={14} />
      <Node x={508} y={174} w={196} title="Tab cache" subtitle="stores each tab" />

      <Edge from={[212, 202]} to={[248, 202]} label="then" />
      <Edge from={[472, 202]} to={[508, 202]} label="store" />

      <NoteText x={16} y={272}>
        Switching to a tab reads from the cache instead of fetching again.
      </NoteText>
    </DiagramFrame>
  );
}
