"use client";

import React from "react";
import { Layout, Menu, Button, Dropdown, Space, Avatar } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthCookie } from "@/app/actions/auth";

type MenuItem = {
  key: string;
  label: string;
  href?: string;
  children?: MenuItem[];
};

interface NavigationProps {
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  items: MenuItem[];
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
    const findSelectedKey = (items: MenuItem[]): string | undefined => {
      for (const item of items) {
        if (item.href && pathname.includes(item.href)) {
          return item.key;
        }
        if (item.children) {
          const childKey = findSelectedKey(item.children);
          if (childKey) return childKey;
        }
      }
      return undefined;
    };

    const key = findSelectedKey(items);
    if (key) {
      setSelectedKey(key);
    }
  }, [pathname, items]);

  async function handleLogout() {
    await clearAuthCookie();
    router.push("/login");
  }

  const buildMenuItems = (items: MenuItem[]): MenuProps["items"] => {
    return items.map((item) => {
      if (item.children) {
        return {
          key: item.key,
          label: item.label,
          children: buildMenuItems(item.children),
        };
      }
      return {
        key: item.key,
        label: item.href ? (
          <Link href={item.href} style={{ textDecoration: "none" }}>
            {item.label}
          </Link>
        ) : (
          item.label
        ),
      };
    });
  };

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
            items={buildMenuItems(items)}
          />
        </Layout.Sider>

        <Layout.Content style={{ padding: "24px 24px 24px 24px", overflow: "auto" }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
