import { DiagramFrame, Edge, Node } from "./primitives";

// One React app; role-based access routes each user type to its own features.
export function BlockPowerDiagram({ label }: { label: string }) {
  return (
    <DiagramFrame label={label} width={820} height={280}>
      <Node x={16} y={108} w={190} h={64} title="One React app" subtitle="~250 users" accent titleSize={15} />

      <Node x={272} y={108} w={196} h={64} title="Role-based access" subtitle="one codebase" titleSize={14} />

      <Edge from={[206, 140]} to={[272, 140]} label="every request" />

      <Node x={560} y={36} w={244} h={62} title="Ambassador" subtitle="points, referrals, voting" titleSize={15} />
      <Node x={560} y={182} w={244} h={62} title="Other user types" subtitle="each sees its own features" titleSize={14} />

      <Edge from={[468, 140]} to={[560, 67]} />
      <Edge from={[468, 140]} to={[560, 213]} />
    </DiagramFrame>
  );
}
