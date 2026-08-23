function LoginPage() {
    const { authUser, isLoading, login } = useAuthStore();
  return (
    <div>
      <h1 className="text-white text-4xl">
        LOGIN PAGE
      </h1>
    </div>
  );
}

export default LoginPage;