import Link from "next/link";

import PoeticForm from "@/components/poetic-form";

import PlaceholderContent from "@/components/demo/placeholder-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import PlaceholderContentUpload from "@/components/demo/placeholder-contentupload";

export default function TagsPage() {
  return (
    <ContentLayout title="Tags">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
          <BreadcrumbLink asChild>
              <Link href="/upload">Upload</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
     
          <BreadcrumbSeparator />

          <BreadcrumbItem>
          <BreadcrumbLink asChild>
              <Link href="/pressupostos">Pressupostos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
          <BreadcrumbLink asChild>
              <Link href="/dashboard">Versificaçao</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

           <BreadcrumbSeparator />

          <BreadcrumbItem>
          <BreadcrumbLink asChild>
              <Link href="/dashboard">Versificaçao</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
          <BreadcrumbLink asChild>
              <Link href="/videoform">Video</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
        </BreadcrumbList>
      </Breadcrumb>












      <PlaceholderContentUpload />









    </ContentLayout>
  );
}
