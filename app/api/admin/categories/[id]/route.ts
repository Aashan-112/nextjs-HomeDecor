import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

async function checkAdminAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Authentication required", status: 401 }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Admin access required", status: 403 }
  }

  return { user, profile }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching category:", error)
      return NextResponse.json(
        { error: "Failed to fetch category" },
        { status: 500 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error in category GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminAuth()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const { name, description, image_url } = body

    if (!name || !description || !image_url) {
      return NextResponse.json(
        { error: "Name, description, and image URL are required" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name,
        description,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        )
      }
      console.error("Error updating category:", error)
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error in category PUT:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminAuth()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const supabase = createServiceRoleClient()

    // First check if there are any products using this category
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", params.id)
      .limit(1)

    if (productsError) {
      console.error("Error checking products:", productsError)
      return NextResponse.json(
        { error: "Failed to check category usage" },
        { status: 500 }
      )
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category - it has associated products" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id)

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        )
      }
      console.error("Error deleting category:", error)
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error in category DELETE:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
