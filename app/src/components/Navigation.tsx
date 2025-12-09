"use client";

import React from "react";
import { Layout, Menu, Button, Dropdown, Space, Avatar } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthCookie } from "@/app/actions/auth";

interface NavigationProps {
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  items: Array<{
    key: string;
    label: string;
    href: string;
  }>;
  children?: React.ReactNode;
}

export function Navigation({
  userName,
  userEmail,
  isAdmin,
  items,
  children,
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = React.useState("");

  React.useEffect(() => {
    const currentItem = items.find((item) => pathname.includes(item.href));
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, [pathname, items]);

  async function handleLogout() {
    await clearAuthCookie();
    router.push("/login");
  }

  const userMenu = [
    {
      key: "profile",
      label: `${userName} (${userEmail})`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Sair",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout>
      <Layout.Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#001529",
          paddingRight: 24,
        }}
      >
        <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          🎵 Desafios Musicais{isAdmin && " (Admin)"}
        </div>

        <Space>
          <Dropdown menu={{ items: userMenu as any }} trigger={["click"]}>
            <Button
              type="text"
              style={{ color: "white" }}
              icon={<UserOutlined />}
            >
              {userName}
            </Button>
          </Dropdown>
        </Space>
      </Layout.Header>

      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Sider
          width={250}
          style={{ background: "#f0f2f5" }}
          collapsible
          collapsedWidth={80}
          defaultCollapsed={false}
          trigger={null}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: "100%", borderRight: 0 }}
            items={items.map((item) => ({
              key: item.key,
              label: (
                <Link href={item.href} style={{ textDecoration: "none" }}>
                  {item.label}
                </Link>
              ),
            }))}
          />
        </Layout.Sider>

        <Layout.Content style={{ padding: "24px 24px 24px 24px", overflow: "auto" }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
