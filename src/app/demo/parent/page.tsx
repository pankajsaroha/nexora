import { redirect } from "next/navigation";

export default function DemoParentRedirect() {
  redirect("/demo/parent/dashboard");
}
