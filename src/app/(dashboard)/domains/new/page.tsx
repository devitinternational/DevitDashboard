// src/app/(dashboard)/domains/new/page.tsx

import { DomainBuilderClient } from "@/components/domain-builder/DomainBuilderClient";

export const metadata = {
  title: "New Domain | Admin Dashboard",
};

export default function NewDomainPage() {
  return <DomainBuilderClient />;
}
