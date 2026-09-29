import { Caption, DiagramFrame, Edge, Node } from "./primitives";

// Backend config drives an engine that renders dynamic forms and tables.
// A separate billing flow runs on Stripe Checkout.
export function QbenchDiagram({ label }: { label: string }) {
  return (
    <DiagramFrame label={label} width={820} height={300}>
      <Caption x={16} y={20}>
        CONFIG-DRIVEN UI
      </Caption>

      <Node x={16} y={44} w={186} h={64} title="Backend config" subtitle="columns, fields, order" titleSize={15} />
      <Node x={256} y={44} w={210} h={64} title="Config-driven engine" subtitle="renders from config" accent titleSize={14} />

      <Edge from={[202, 76]} to={[256, 76]} label="sends config" />

      <Node x={556} y={16} w={200} h={54} title="Dynamic forms" subtitle="every field type" titleSize={14} />
      <Node x={556} y={92} w={200} h={54} title="Dynamic tables" subtitle="configured columns" titleSize={14} />

      <Edge from={[466, 76]} to={[556, 43]} />
      <Edge from={[466, 76]} to={[556, 119]} />

      <Caption x={16} y={200}>
        BILLING
      </Caption>

      <Node x={16} y={216} w={186} h={60} title="Billing module" subtitle="subscriptions" titleSize={15} />
      <Node x={256} y={216} w={210} h={60} title="Stripe Checkout" subtitle="payments & invoices" titleSize={14} />

      <Edge from={[202, 246]} to={[256, 246]} label="redirect" />
    </DiagramFrame>
  );
}
