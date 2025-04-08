
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";

interface MessageTabsProps {
  form: UseFormReturn<any>;
  messages: {
    m1: string;
    m2: string;
    m3: string;
  };
}

export function MessageTabs({ form, messages }: MessageTabsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="m1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="m1">Message 1</TabsTrigger>
            <TabsTrigger value="m2">Message 2</TabsTrigger>
            <TabsTrigger value="m3">Message 3</TabsTrigger>
          </TabsList>
          <TabsContent value="m1" className="pt-4">
            <FormField
              control={form.control}
              name="m1"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="First message to candidate"
                      className="min-h-[200px]"
                      {...field}
                      value={field.value || messages.m1}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="m2" className="pt-4">
            <FormField
              control={form.control}
              name="m2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Second message to candidate"
                      className="min-h-[200px]"
                      {...field}
                      value={field.value || messages.m2}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="m3" className="pt-4">
            <FormField
              control={form.control}
              name="m3"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Third message to candidate"
                      className="min-h-[200px]"
                      {...field}
                      value={field.value || messages.m3}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
