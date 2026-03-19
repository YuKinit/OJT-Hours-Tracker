import * as React from "react";

import { Card, CardBody, CardHeader } from "@/components/ui";

export function SidePanel(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="hidden lg:block">
      <CardHeader title={props.title} subtitle={props.subtitle} />
      <CardBody className="space-y-3 text-sm text-zinc-700 dark:text-zinc-200">{props.children}</CardBody>
    </Card>
  );
}

