import { Caption, DiagramFrame, Edge, Node } from "./primitives";

// Row 1: the v0 UI becomes a Next.js app wired through Redux to a REST API.
// Row 2: a streaming WebSocket chat, and direct-to-S3 uploads via pre-signed URLs.
export function CcmDiagram({ label }: { label: string }) {
  return (
    <DiagramFrame label={label} width={840} height={348}>
      <Caption x={16} y={20}>
        APP
      </Caption>

      <Node x={16} y={36} w={176} title="v0 UI" subtitle="generated design" />
      <Node x={228} y={36} w={176} title="Next.js" subtitle="Pages Router · SSR/SSG" titleSize={15} />
      <Node x={440} y={36} w={176} title="Redux store" subtitle="app state" />
      <Node x={652} y={36} w={176} title="REST API" subtitle="data" />

      <Edge from={[192, 64]} to={[228, 64]} label="ported to" />
      <Edge from={[404, 64]} to={[440, 64]} label="wires" />
      <Edge from={[616, 64]} to={[652, 64]} label="fetch" />

      <Caption x={16} y={148}>
        REAL-TIME CHAT
      </Caption>

      <Node x={16} y={164} w={196} title="AI Sync chat" subtitle="ask about contracts" titleSize={14} />
      <Node x={248} y={164} w={160} title="WebSocket" subtitle="streaming" />
      <Node x={444} y={164} w={176} title="Backend" subtitle="provider routing" />

      <Edge from={[212, 192]} to={[248, 192]} label="open" />
      <Edge from={[408, 192]} to={[444, 192]} label="query" />
      <Edge from={[532, 236]} to={[114, 236]} dashed label="streams replies back" />

      <Caption x={16} y={276}>
        FILE UPLOAD
      </Caption>

      <Node x={16} y={292} w={196} title="File upload" subtitle="up to 25 MB" />
      <Node x={248} y={292} w={180} title="Pre-signed URL" subtitle="from backend" titleSize={14} />
      <Node x={464} y={292} w={160} title="Amazon S3" subtitle="direct upload" />

      <Edge from={[212, 320]} to={[248, 320]} label="request URL" />
      <Edge from={[428, 320]} to={[464, 320]} label="upload file" />
    </DiagramFrame>
  );
}
