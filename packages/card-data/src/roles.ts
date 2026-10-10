import type { RoleDefinition } from "./types";

export const ROLES: RoleDefinition[] = [
  {
    id: "sheriff",
    originalName: "Sheriff",
    nameVi: "Cảnh Sát Trưởng",
    textVi: "Loại bỏ tất cả Kẻ Ngoài Vòng Pháp Luật và Kẻ Phản Bội.",
    image: "/cards/roles/sheriff.png",
    category: "role",
    role: "sheriff",
  },
  {
    id: "deputy",
    originalName: "Deputy",
    nameVi: "Cảnh Sát Phó",
    textVi: "Bảo vệ Cảnh Sát Trưởng và cùng loại bỏ những kẻ thù của luật pháp.",
    image: "/cards/roles/deputy.png",
    category: "role",
    role: "deputy",
  },
  {
    id: "outlaw",
    originalName: "Outlaw",
    nameVi: "Kẻ Ngoài Vòng Pháp Luật",
    textVi: "Loại bỏ Cảnh Sát Trưởng.",
    image: "/cards/roles/outlaw.png",
    category: "role",
    role: "outlaw",
  },
  {
    id: "renegade",
    originalName: "Renegade",
    nameVi: "Kẻ Phản Bội",
    textVi: "Trở thành người sống sót cuối cùng sau khi Cảnh Sát Trưởng bị loại.",
    image: "/cards/roles/renegade.png",
    category: "role",
    role: "renegade",
  },
];

const ROLE_COUNTS: Record<number, Record<RoleDefinition["role"], number>> = {
  4: { sheriff: 1, deputy: 0, outlaw: 2, renegade: 1 },
  5: { sheriff: 1, deputy: 1, outlaw: 2, renegade: 1 },
  6: { sheriff: 1, deputy: 1, outlaw: 3, renegade: 1 },
  7: { sheriff: 1, deputy: 2, outlaw: 3, renegade: 1 },
};

export function getRoleDefinitions(playerCount: number): RoleDefinition[] {
  if (!Number.isInteger(playerCount) || playerCount < 4 || playerCount > 7) {
    throw new RangeError("Player count must be an integer from 4 through 7.");
  }

  const counts = ROLE_COUNTS[playerCount];
  return ROLES.flatMap((definition) =>
    Array.from({ length: counts[definition.role] }, () => ({ ...definition })),
  );
}
