"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Upload } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { NotificationModal } from "@/lib/actions/notification-actions"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase/client"
import { updateNotification, toggleNotificationStatus, deleteNotification } from "@/lib/actions/notification-actions"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationModal[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationModal | null>(null)
  const [previewData, setPreviewData] = useState<NotificationModal | null>(null) // ✅ NOVO: Estado separado para preview
  const [deleteTarget, setDeleteTarget] = useState<NotificationModal | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    imagePreview: "",
    target_audience: "all" as "free" | "premium" | "all",
    is_active: true,
    expires_at: "",
  })

  // Load notifications
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      const { data } = await response.json()
      setNotifications(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2000000) {
        toast({
          title: "Erro",
          description: "Imagem deve ter no máximo 2MB",
          variant: "destructive",
        })
        return
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: "",
      target_audience: "all",
      is_active: true,
      expires_at: "",
    })
    setSelectedNotification(null)
  }

  // ✅ CORRIGIDO: Garantir reset completo
  const handleCreate = () => {
    console.log("🆕 [DEBUG] handleCreate chamado")

    // Resetar TUDO
    setSelectedNotification(null)
    setPreviewData(null)
    setFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: "",
      target_audience: "all",
      is_active: true,
      expires_at: "",
    })

    console.log("✅ [DEBUG] Estado resetado, abrindo modal...")
    setIsCreateOpen(true)
  }

  const handleEdit = (notification: NotificationModal) => {
    setSelectedNotification(notification)
    setPreviewData(null)
    setFormData({
      title: notification.title,
      description: notification.description || "",
      image: null,
      imagePreview: notification.image_url,
      target_audience: notification.target_audience,
      is_active: notification.is_active,
      expires_at: notification.expires_at || "",
    })
    setIsCreateOpen(true)
  }

  const handlePreview = (notification: NotificationModal) => {
    setPreviewData(notification) // ✅ Usar previewData ao invés de selectedNotification
    setIsPreviewOpen(true)
  }

  const handleDeleteClick = (notification: NotificationModal) => {
    setDeleteTarget(notification)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("📝 [FORM-1] Form submission started")

    // ✅ ADICIONADO: Debug do estado
    console.log("🎯 [DEBUG] selectedNotification:", selectedNotification)
    console.log("🎯 [DEBUG] selectedNotification é null?", selectedNotification === null)

    console.log("📝 [FORM-2] Form data state:", {
      title: formData.title,
      description: formData.description,
      hasImage: !!formData.image,
      imageType: formData.image?.type,
      imageSize: formData.image?.size,
      target_audience: formData.target_audience,
      is_active: formData.is_active,
      expires_at: formData.expires_at,
    })

    if (!formData.title.trim()) {
      console.log("❌ [FORM-3] Validation failed: missing title")
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!selectedNotification && !formData.image) {
      console.log("❌ [FORM-4] Validation failed: missing image for new notification")
      toast({
        title: "Erro",
        description: "Imagem é obrigatória",
        variant: "destructive",
      })
      return
    }

    console.log("✅ [FORM-5] Validation passed, constructing FormData")

    startTransition(async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const data = new FormData()
        data.append("title", formData.title)
        data.append("description", formData.description)
        if (formData.image) {
          data.append("image", formData.image)
        }
        data.append("target_audience", formData.target_audience)
        data.append("is_active", String(formData.is_active))
        if (formData.expires_at) {
          data.append("expires_at", formData.expires_at)
        }

        if (session?.access_token) {
          data.append("access_token", session.access_token)
          console.log("🔑 [FORM-6.5] Access token added to FormData")
        }

        console.log("📦 [FORM-6] FormData being sent:")
        for (const [key, value] of data.entries()) {
          if (key === "access_token") {
            console.log(`  ${key}: [REDACTED]`)
          } else if (value instanceof File) {
            console.log(`  ${key}:`, {
              name: value.name,
              size: value.size,
              type: value.type,
            })
          } else {
            console.log(`  ${key}:`, value)
          }
        }

        if (selectedNotification) {
          console.log("🔄 [FORM-7] Updating existing notification:", selectedNotification.id)
          data.append("old_image_url", selectedNotification.image_url)
          const result = await updateNotification(selectedNotification.id, data)
          console.log("✅ [FORM-8] Update result:", result)
          toast({
            title: "Sucesso",
            description: "Notificação atualizada com sucesso",
          })
        } else {
          console.log("➕ [FORM-9] Creating notification via API")

          const response = await fetch("/api/notifications", {
            method: "POST",
            body: data,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create notification")
          }

          const result = await response.json()
          console.log("✅ [FORM-10] API response:", result)

          toast({
            title: "Sucesso",
            description: "Notificação criada com sucesso",
          })
        }

        setIsCreateOpen(false)
        resetForm()
        await loadNotifications()
      } catch (error) {
        console.error("❌ [FORM-11] Error during submission:", error)
        console.error("❌ [FORM-12] Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        })
        toast({
          title: "Erro",
          description: selectedNotification ? "Falha ao atualizar notificação" : "Falha ao criar notificação",
          variant: "destructive",
        })
      }
    })
  }

  const handleToggleStatus = async (notification: NotificationModal) => {
    startTransition(async () => {
      try {
        await toggleNotificationStatus(notification.id, !notification.is_active)
        toast({
          title: "Sucesso",
          description: `Notificação ${!notification.is_active ? "ativada" : "desativada"}`,
        })
        await loadNotifications()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao alterar status",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    startTransition(async () => {
      try {
        await deleteNotification(deleteTarget.id, deleteTarget.image_url)
        toast({
          title: "Sucesso",
          description: "Notificação excluída com sucesso",
        })
        setIsDeleteOpen(false)
        setDeleteTarget(null)
        await loadNotifications()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir notificação",
          variant: "destructive",
        })
      }
    })
  }

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "free":
        return <Badge className="bg-blue-500">Gratuito</Badge>
      case "premium":
        return <Badge className="bg-yellow-500">Premium</Badge>
      case "all":
        return <Badge className="bg-green-500">Todos</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Gerenciador de Notificações</h1>
            <p className="text-stone-600 mt-1">Crie e gerencie modais que aparecem ao abrir o app</p>
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notificação
          </Button>
        </div>

        {/* Notifications Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Nenhuma notificação criada</h3>
            <p className="text-stone-600">Clique em "Nova Notificação" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
              <Card key={notification.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={notification.image_url || "/placeholder.svg"}
                      alt={notification.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate mb-2">{notification.title}</h3>
                  {notification.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{notification.description}</p>
                  )}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {getAudienceBadge(notification.target_audience)}
                    <Badge variant={notification.is_active ? "default" : "secondary"}>
                      {notification.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {notification.view_count || 0} visualizações
                    </div>
                    <div>Criado em {formatDate(notification.created_at)}</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notification.is_active}
                      onCheckedChange={() => handleToggleStatus(notification)}
                      disabled={isPending}
                    />
                    <span className="text-xs text-muted-foreground">
                      {notification.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(notification)} disabled={isPending}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePreview(notification)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(notification)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedNotification ? "Editar Notificação" : "Nova Notificação"}</DialogTitle>
              <DialogDescription>Preencha os dados da notificação que aparecerá para os usuários</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                  placeholder="Ex: Novidades da semana"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  maxLength={300}
                  placeholder="Descrição opcional..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem *</Label>
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                  <input
                    id="image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image" className="flex flex-col items-center gap-2 cursor-pointer">
                    {formData.imagePreview ? (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          src={formData.imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-stone-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Clique para fazer upload</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WEBP (máx. 2MB)</p>
                          <p className="text-xs text-muted-foreground">Tamanho recomendado: 800x600px</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Público-alvo</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value: "free" | "premium" | "all") =>
                    setFormData((prev) => ({ ...prev, target_audience: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Notificação ativa
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Data de expiração (opcional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetForm()
                  }}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                {/* ✅ CORRIGIDO: Usar previewData ao invés de selectedNotification */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (formData.title && formData.imagePreview) {
                      setPreviewData({
                        id: "",
                        title: formData.title,
                        description: formData.description,
                        image_url: formData.imagePreview,
                        target_audience: formData.target_audience,
                        is_active: formData.is_active,
                        created_at: new Date().toISOString(),
                        expires_at: formData.expires_at || null,
                      })
                      setIsPreviewOpen(true)
                    }
                  }}
                  disabled={!formData.title || !formData.imagePreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-md">
            {/* ✅ CORRIGIDO: Usar previewData */}
            {previewData && (
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={previewData.image_url || "/placeholder.svg"}
                    alt={previewData.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">{previewData.title}</h3>
                  {previewData.description && <p className="text-muted-foreground">{previewData.description}</p>}
                </div>
                <Button onClick={() => setIsPreviewOpen(false)} className="w-full">
                  Fechar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A notificação "{deleteTarget?.title}" será permanentemente excluída.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                {isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
