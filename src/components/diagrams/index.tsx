import { BlockPowerDiagram } from "./block-power";
import { CcmDiagram } from "./ccm";
import { DdmindDiagram } from "./ddmind";
import { PaperTigerDiagram } from "./paper-tiger";
import { QbenchDiagram } from "./qbench";

type DiagramComponent = (props: { label: string }) => React.ReactElement;

// Keyed by project slug. A project's `diagram` field supplies the aria-label.
const registry: Record<string, DiagramComponent> = {
  ddmind: DdmindDiagram,
  ccm: CcmDiagram,
  "paper-tiger": PaperTigerDiagram,
  "block-power": BlockPowerDiagram,
  qbench: QbenchDiagram,
};

export function ArchitectureDiagram({ slug, label }: { slug: string; label: string }) {
  const Diagram = registry[slug];
  if (!Diagram) return null;
  return <Diagram label={label} />;
}
