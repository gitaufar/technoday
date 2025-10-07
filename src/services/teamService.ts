import supabase from "@/utils/supabase";

export type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: "legal" | "management" | "procurement";
  status: "active" | "pending" | "invited";
  last_login: string | null;
  avatar_url?: string;
};

/**
 * Get initials from email (first letter only, like Google)
 * @param email - User's email address
 * @returns Single uppercase letter
 */
export function getEmailInitial(email: string): string {
  if (!email) return '?';
  return email.charAt(0).toUpperCase();
}

/**
 * Get initials from full name (max 2 letters)
 * @param fullName - User's full name
 * @returns Initials (max 2 uppercase letters)
 */
export function getNameInitials(fullName: string): string {
  if (!fullName) return '?';
  const names = fullName.trim().split(' ').filter(Boolean);
  if (names.length === 0) return '?';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

type ProfileResponse = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  last_sign_in_at: string | null;
  company_id: string | null;
};

/**
 * Fetch all team members for a specific company
 * @param companyId - The ID of the company
 * @returns Array of team members
 */
export async function getTeamMembers(companyId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }

  const formattedMembers: TeamMember[] = (data as ProfileResponse[])?.map((profile) => ({
    id: profile.id,
    full_name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
    email: profile.email || '',
    role: (profile.role as 'legal' | 'management' | 'procurement') || 'management',
    status: profile.last_sign_in_at ? 'active' : 'invited',
    last_login: profile.last_sign_in_at,
    avatar_url: profile.avatar_url || undefined,
  })) || [];

  return formattedMembers;
}

/**
 * Get team member count for a company
 * @param companyId - The ID of the company
 * @returns Number of team members
 */
export async function getTeamMemberCount(companyId: string): Promise<number> {
  const { count, error } = await supabase
    .from("company_users")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching team member count:", error);
    throw error;
  }

  return count || 0;
}

/**
 * Fetch top team members (limited) for dashboard preview
 * @param companyId - The ID of the company
 * @param limit - Number of members to return (default: 3)
 * @returns Array of team members
 */
export async function getTopTeamMembers(
  companyId: string,
  limit: number = 3
): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, last_sign_in_at, company_id")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top team members:", error);
    throw error;
  }

  const formattedMembers: TeamMember[] = (data as ProfileResponse[])?.map((profile) => ({
    id: profile.id,
    full_name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
    email: profile.email || '',
    role: (profile.role as 'legal' | 'management' | 'procurement') || 'management',
    status: profile.last_sign_in_at ? 'active' : 'invited',
    last_login: profile.last_sign_in_at,
    avatar_url: profile.avatar_url || undefined,
  })) || [];

  return formattedMembers;
}
