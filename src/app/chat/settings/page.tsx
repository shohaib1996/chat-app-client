"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Palette, Volume2, Smartphone, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    messages: true,
    groups: true,
    calls: false,
    sounds: true,
  })

  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    lastSeen: false,
    profilePhoto: "contacts",
  })

  const [volume, setVolume] = useState([75])

  return (
    <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-background to-background/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your NeoChat experience</p>
        </div>

        {/* Appearance */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Animations</Label>
              <Switch id="animations" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compact">Compact Mode</Label>
              <Switch id="compact" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Control when and how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications">Message Notifications</Label>
              <Switch
                id="message-notifications"
                checked={notifications.messages}
                onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="group-notifications">Group Notifications</Label>
              <Switch
                id="group-notifications"
                checked={notifications.groups}
                onCheckedChange={(checked) => setNotifications({ ...notifications, groups: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="call-notifications">Call Notifications</Label>
              <Switch
                id="call-notifications"
                checked={notifications.calls}
                onCheckedChange={(checked) => setNotifications({ ...notifications, calls: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-notifications">Sound Notifications</Label>
              <Switch
                id="sound-notifications"
                checked={notifications.sounds}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sounds: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Notification Volume
              </Label>
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
              <div className="text-sm text-muted-foreground text-right">{volume[0]}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="read-receipts">Read Receipts</Label>
              <Switch
                id="read-receipts"
                checked={privacy.readReceipts}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, readReceipts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="last-seen">Last Seen</Label>
              <Switch
                id="last-seen"
                checked={privacy.lastSeen}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, lastSeen: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="profile-photo">Profile Photo Visibility</Label>
              <Select
                value={privacy.profilePhoto}
                onValueChange={(value) => setPrivacy({ ...privacy, profilePhoto: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Smartphone className="w-4 h-4 mr-2" />
              Linked Devices
              <Badge variant="secondary" className="ml-auto">
                2
              </Badge>
            </Button>

            <Button variant="outline" className="w-full justify-start bg-transparent">
              Export Chat History
            </Button>

            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="glass-effect border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold neo-gradient bg-clip-text text-transparent">NeoChat</div>
              <div className="text-sm text-muted-foreground">Version 2.1.0</div>
              <div className="text-xs text-muted-foreground">© 2024 NeoChat. All rights reserved.</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
