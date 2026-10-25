import {
  Baby,
  BookOpen,
  Droplets,
  Flame,
  GraduationCap,
  Heart,
  House,
  Leaf,
  Package,
  Shirt,
  Snowflake,
  Stethoscope,
  Sun,
  TreePine,
  Users,
  Utensils,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IconName } from "@/lib/schema";

const MAP: Record<IconName, ComponentType<LucideProps>> = {
  shirt: Shirt,
  heart: Heart,
  book: BookOpen,
  droplet: Droplets,
  house: House,
  utensils: Utensils,
  flame: Flame,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
  package: Package,
  sun: Sun,
  tree: TreePine,
  users: Users,
  snowflake: Snowflake,
  baby: Baby,
  leaf: Leaf,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = MAP[name] ?? Heart;
  return <C {...props} />;
}
