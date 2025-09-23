import { Link } from "react-router-dom";

const AuthFooter = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default AuthFooter;
