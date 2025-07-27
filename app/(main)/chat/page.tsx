import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="p-4 flex items-center justify-center h-[calc(100dvh-8rem)]">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <MessageSquare className="h-12 w-12 mx-auto text-primary" />
          <CardTitle className="mt-4">Community Chat</CardTitle>
          <CardDescription>Coming Soon!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect with your neighbors, discuss local issues, and stay informed with real-time community chat.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
