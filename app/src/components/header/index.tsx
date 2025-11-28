import Link from "next/link";

export function Header() {
    return (
        <div className="header">
            <Link href={'/'}>Home</Link>
            {" "}|{" "} <Link href={'/posts'}>Posts</Link>
            {" "}|{" "} <Link href={'/test'}>Teste</Link>
        </div>
    );
};