import { DiagramFrame, Edge, Node } from "./primitives";

// Five modules feed a Redux store, which reads and writes Google Cloud Storage
// through signed URLs.
export function PaperTigerDiagram({ label }: { label: string }) {
  const modules = [
    { title: "Outliner", subtitle: "restructure" },
    { title: "Reader", subtitle: "highlight & annotate" },
    { title: "Explorer", subtitle: "extracted data" },
    { title: "Builder", subtitle: "cluster into a tree" },
    { title: "Writer", subtitle: "word processor" },
  ];
  const moduleW = 200;
  const moduleH = 48;
  const top = 16;
  const gap = 8;

  const storeX = 300;
  const storeW = 168;
  const storeY = 128;
  const storeH = 64;
  const storeCy = storeY + storeH / 2;

  return (
    <DiagramFrame label={label} width={820} height={296}>
      {modules.map((m, i) => {
        const y = top + i * (moduleH + gap);
        const cy = y + moduleH / 2;
        return (
          <g key={m.title}>
            <Node x={16} y={y} w={moduleW} h={moduleH} title={m.title} subtitle={m.subtitle} titleSize={14} />
            <Edge from={[16 + moduleW, cy]} to={[storeX, storeCy]} />
          </g>
        );
      })}

      <Node x={storeX} y={storeY} w={storeW} h={storeH} title="Redux store" subtitle="single source of state" accent titleSize={15} />

      <Node x={568} y={storeY} w={236} h={storeH} title="Google Cloud Storage" subtitle="~2 MB JSON per paper" titleSize={14} />

      <Edge from={[storeX + storeW, storeCy]} to={[568, storeCy]} label="signed URLs" />
    </DiagramFrame>
  );
}
