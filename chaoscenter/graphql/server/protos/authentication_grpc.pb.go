// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.3.0
// - protoc             v3.21.12
// source: authentication.proto

package protos

import (
	context "context"

	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

const (
	AuthRpcService_ValidateRequest_FullMethodName = "/protos.authRpcService/ValidateRequest"
	AuthRpcService_GetProjectById_FullMethodName  = "/protos.authRpcService/GetProjectById"
	AuthRpcService_GetUserById_FullMethodName     = "/protos.authRpcService/GetUserById"
)

// AuthRpcServiceClient is the client API for AuthRpcService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type AuthRpcServiceClient interface {
	ValidateRequest(ctx context.Context, in *ValidationRequest, opts ...grpc.CallOption) (*ValidationResponse, error)
	GetProjectById(ctx context.Context, in *GetProjectByIdRequest, opts ...grpc.CallOption) (*GetProjectByIdResponse, error)
	GetUserById(ctx context.Context, in *GetUserByIdRequest, opts ...grpc.CallOption) (*GetUserByIdResponse, error)
}

type authRpcServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewAuthRpcServiceClient(cc grpc.ClientConnInterface) AuthRpcServiceClient {
	return &authRpcServiceClient{cc}
}

func (c *authRpcServiceClient) ValidateRequest(ctx context.Context, in *ValidationRequest, opts ...grpc.CallOption) (*ValidationResponse, error) {
	out := new(ValidationResponse)
	err := c.cc.Invoke(ctx, AuthRpcService_ValidateRequest_FullMethodName, in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authRpcServiceClient) GetProjectById(ctx context.Context, in *GetProjectByIdRequest, opts ...grpc.CallOption) (*GetProjectByIdResponse, error) {
	out := new(GetProjectByIdResponse)
	err := c.cc.Invoke(ctx, AuthRpcService_GetProjectById_FullMethodName, in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authRpcServiceClient) GetUserById(ctx context.Context, in *GetUserByIdRequest, opts ...grpc.CallOption) (*GetUserByIdResponse, error) {
	out := new(GetUserByIdResponse)
	err := c.cc.Invoke(ctx, AuthRpcService_GetUserById_FullMethodName, in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// AuthRpcServiceServer is the server API for AuthRpcService service.
// All implementations must embed UnimplementedAuthRpcServiceServer
// for forward compatibility
type AuthRpcServiceServer interface {
	ValidateRequest(context.Context, *ValidationRequest) (*ValidationResponse, error)
	GetProjectById(context.Context, *GetProjectByIdRequest) (*GetProjectByIdResponse, error)
	GetUserById(context.Context, *GetUserByIdRequest) (*GetUserByIdResponse, error)
	mustEmbedUnimplementedAuthRpcServiceServer()
}

// UnimplementedAuthRpcServiceServer must be embedded to have forward compatible implementations.
type UnimplementedAuthRpcServiceServer struct {
}

func (UnimplementedAuthRpcServiceServer) ValidateRequest(context.Context, *ValidationRequest) (*ValidationResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ValidateRequest not implemented")
}
func (UnimplementedAuthRpcServiceServer) GetProjectById(context.Context, *GetProjectByIdRequest) (*GetProjectByIdResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetProjectById not implemented")
}
func (UnimplementedAuthRpcServiceServer) GetUserById(context.Context, *GetUserByIdRequest) (*GetUserByIdResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetUserById not implemented")
}
func (UnimplementedAuthRpcServiceServer) mustEmbedUnimplementedAuthRpcServiceServer() {}

// UnsafeAuthRpcServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to AuthRpcServiceServer will
// result in compilation errors.
type UnsafeAuthRpcServiceServer interface {
	mustEmbedUnimplementedAuthRpcServiceServer()
}

func RegisterAuthRpcServiceServer(s grpc.ServiceRegistrar, srv AuthRpcServiceServer) {
	s.RegisterService(&AuthRpcService_ServiceDesc, srv)
}

func _AuthRpcService_ValidateRequest_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ValidationRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthRpcServiceServer).ValidateRequest(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: AuthRpcService_ValidateRequest_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthRpcServiceServer).ValidateRequest(ctx, req.(*ValidationRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _AuthRpcService_GetProjectById_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetProjectByIdRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthRpcServiceServer).GetProjectById(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: AuthRpcService_GetProjectById_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthRpcServiceServer).GetProjectById(ctx, req.(*GetProjectByIdRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _AuthRpcService_GetUserById_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetUserByIdRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthRpcServiceServer).GetUserById(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: AuthRpcService_GetUserById_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthRpcServiceServer).GetUserById(ctx, req.(*GetUserByIdRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// AuthRpcService_ServiceDesc is the grpc.ServiceDesc for AuthRpcService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var AuthRpcService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "protos.authRpcService",
	HandlerType: (*AuthRpcServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "ValidateRequest",
			Handler:    _AuthRpcService_ValidateRequest_Handler,
		},
		{
			MethodName: "GetProjectById",
			Handler:    _AuthRpcService_GetProjectById_Handler,
		},
		{
			MethodName: "GetUserById",
			Handler:    _AuthRpcService_GetUserById_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "authentication.proto",
}
