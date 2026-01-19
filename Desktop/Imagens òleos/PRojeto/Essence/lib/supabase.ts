import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjiigqwvuyzlskozrbnw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWlncXd2dXl6bHNrb3pyYm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTUyNDEsImV4cCI6MjA3ODA5MTI0MX0.ABi8ycn_0FDZYKkQOQoTEcQyIfyuAYBv3QE8n1WR6rk'

export const supabase = createClient(supabaseUrl, supabaseKey)
